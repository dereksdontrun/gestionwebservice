<?php
/**
 * Gestión de pedidos de proveedores Webservice 16/05/2022 
 *
 *  @author    Sergio™ <sergio@lafrikileria.com>
 *    
 */

if (!defined('_PS_VERSION_'))
    exit;

class AdminWebserviceOrdersController extends ModuleAdminController {
    
    public function __construct() {
        require_once (dirname(__FILE__) .'/../../gestionwebservice.php');

        $this->lang = false;
        $this->bootstrap = true;        
        $this->context = Context::getContext();
        
        parent::__construct();
        
    }
    
    /**
     * AdminController::init() override
     * @see AdminController::init()
     */
    public function init() {
        $this->display = 'add';
        parent::init();
    }
   
    /*
     *
     */
    public function setMedia(){
        parent::setMedia();
        $this->addJs($this->module->getPathUri().'views/js/back_pedidos_webservice.js');
        //añadimos la dirección para el css
        $this->addCss($this->module->getPathUri().'views/css/back_pedidos_webservice.css');
    }


    /**
     * AdminController::renderForm() override
     * @see AdminController::renderForm()
     */
    public function renderForm() {    

        //generamos el token de AdminWebserviceOrders ya que lo vamos a usar en el archivo de javascript . Lo almacenaremos en un input hidden para acceder a el desde js
        $token_admin_modulo = Tools::getAdminTokenLite('AdminWebserviceOrders');

        $this->fields_form = array(
            'legend' => array(
                'title' => 'Pedidos Webservice',
                'icon' => 'icon-pencil'
            ),
            'input' => array( 
                //input hidden con el token para usarlo por ajax etc
                array(  
                    'type' => 'hidden',                    
                    'name' => 'token_admin_modulo_'.$token_admin_modulo,
                    'id' => 'token_admin_modulo_'.$token_admin_modulo,
                    'required' => false,                                        
                ),                 
            ),
            
            // 'reset' => array('title' => 'Limpiar', 'icon' => 'process-icon-eraser icon-eraser'),   
            // 'submit' => array('title' => 'Guardar', 'icon' => 'process-icon-save icon-save'),            
        );

        // $this->displayInformation(
        //     'Revisar productos que actualmente se encuentran en la categoría Prepedido, vendidos o no, o revisar productos vendidos sin stock que se encuentran en pedidos en espera, con o sin categoría prepedido'
        // );
        
        return parent::renderForm();
    }

    public function postProcess() {

        parent::postProcess();

        
    }

    //función que devuelve al front los usuarios/origen externos del webservice para formar el SELECT en el controlador
    public function ajaxProcessGetUsers() {
        
        $sql_usuarios_webservice = 'SELECT id_webservice_user, user
        FROM lafrips_webservice_users
        ORDER BY user ASC';

        $usuarios_webservice = Db::getInstance()->executeS($sql_usuarios_webservice);        

        if ($usuarios_webservice) {      
            //devolvemos la lista 
            die(Tools::jsonEncode(array('message'=>'Info de usuarios obtenida correctamente', 'users_info' => $usuarios_webservice)));
        } else { 
            //error al sacar los usuarios           
            die(Tools::jsonEncode(array('error'=> true, 'message'=>'Error obteniendo la información de los usuarios de Webservice')));
        }   
    }

    //función que devuelve al front los posibles estados en que se encuentran los pedidos del webservice para formar el SELECT en el controlador. 
    public function ajaxProcessGetOrderStates() {
        
        $sql_estados_pedido = 'SELECT DISTINCT ord.current_state AS id_estado, IFNULL(osl.name, "Error en pedido") AS estado
        FROM lafrips_webservice_orders wor
        LEFT JOIN lafrips_orders ord ON ord.id_order = wor.id_order
        LEFT JOIN lafrips_order_state_lang osl ON osl.id_order_state = ord.current_state AND osl.id_lang = 1
        ORDER BY osl.name';

        $estados_pedido = Db::getInstance()->executeS($sql_estados_pedido);        

        if ($estados_pedido) {      
            //devolvemos la lista 
            die(Tools::jsonEncode(array('message'=>'Info de estados de pedido obtenida correctamente', 'estados_info' => $estados_pedido)));
        } else { 
            //error al sacar los usuarios           
            die(Tools::jsonEncode(array('error'=> true, 'message'=>'Error obteniendo los estados de pedidos de Webservice')));
        }   
    }

    /*
    * Función que busca los pedidos que han entrado a través del webservice de la tabla lafrips_webservice_orders, devuelve la dirección de entrega también. La llamamos mediante javascript/ajax al cargar la vista del controlador 
    *
    */
    public function ajaxProcessGetOrderList(){    
        //comprobamos si han llegado argumentos para la búsqueda y filtros        
        $buscar_id_order = Tools::getValue('buscar_id_order',0);
        $buscar_external_id_order = Tools::getValue('buscar_external_id_order',0);
        $buscar_origen = Tools::getValue('buscar_origen',0);
        $buscar_estado = Tools::getValue('buscar_estado',0);
        $buscar_pedidos_desde = Tools::getValue('buscar_pedidos_desde',0);
        $buscar_pedidos_hasta = Tools::getValue('buscar_pedidos_hasta',0);

        //este valor, si existe, indica como ordenar el resultado de búsqueda. De momento puede ser por id_webservice_order arriba y abajo, o fecha de pedido arriba y abajo. Ambos devolverían el mismo resultado
        $ordenar = Tools::getValue('ordenar',0);
        if ($ordenar == 'orden_fecha_abajo') {
            $order_by = ' ORDER BY wor.date_add DESC';
        } elseif ($ordenar == 'orden_fecha_arriba') {
            $order_by = ' ORDER BY wor.date_add ASC';
        } elseif ($ordenar == 'orden_id_abajo') {
            $order_by = ' ORDER BY wor.id_webservice_order DESC';
        } elseif ($ordenar == 'orden_id_arriba') {
            $order_by = ' ORDER BY wor.id_webservice_order ASC';
        } else {
            $order_by = ' ORDER BY wor.id_webservice_order DESC';
        }

        //si hay filtros en la búsqueda los aplicamos a la SELECT
        if ($buscar_id_order) {
            //para el id_order de prestashop buscamos el valor exacto
            $where_id_order = ' AND wor.id_order = '.$buscar_id_order;
        } else {
            $where_id_order = '';
        }

        if ($buscar_external_id_order) {
            //para el external_id_order buscamos el valor LIKE
            $where_external_id_order = ' AND wor.external_id_order LIKE "%'.$buscar_external_id_order.'%" ';
        } else {
            $where_external_id_order = '';
        }

        if ($buscar_origen) {
            $where_origen = ' AND wor.id_webservice_user = '.$buscar_origen;
        } else {
            $where_origen = '';
        }

        if ($buscar_estado) {
            $where_estado = ' AND ord.current_state = '.$buscar_estado;            
        } else {
            $where_estado = '';
        }

        if ($buscar_pedidos_desde && $buscar_pedidos_hasta) {
            $where_fecha = ' AND wor.date_add BETWEEN  "'.$buscar_pedidos_desde.'"  AND "'.$buscar_pedidos_hasta.'" + INTERVAL 1 DAY ';            
        } elseif ($buscar_pedidos_desde && !$buscar_pedidos_hasta) {
            $where_fecha = ' AND wor.date_add > "'.$buscar_pedidos_desde.'" ';  
        } elseif (!$buscar_pedidos_desde && $buscar_pedidos_hasta) {
            $where_fecha = ' AND wor.date_add < "'.$buscar_pedidos_hasta.'" ';    
        } else {
            $where_fecha = ''; 
        }

        //obtenemos el token de AdminOrders para crear el enlace al pedido en backoffice
        $id_employee = Context::getContext()->employee->id;
        $tab = 'AdminOrders';
        $token_adminorders = Tools::getAdminToken($tab . (int) Tab::getIdFromClassName($tab) . (int) $id_employee);
        
        $url_base = Tools::getHttpHost(true).__PS_BASE_URI__;
        // index.php?controller=AdminOrders&id_order=362263&vieworder&token=b192540700c383eeb6b26f1da43998da
        $url_order_back = $url_base.'lfadminia/index.php?controller=AdminOrders&vieworder&token='.$token_adminorders.'&id_order=';

        //obtenemos los pedidos de la tabla webservice orders, con su estado en Prestashop
        $sql_order_list = 'SELECT wor.id_webservice_order AS id_webservice_order, wor.id_webservice_user AS id_webservice_user, wor.user_name AS user, wor.id_order AS id_order,
        wor.external_id_order AS external_id_order, 
        IF(wor.carrier_name = "", "No asignado", wor.carrier_name) AS carrier, 
        wor.date_add AS date_add, wor.error AS error,
        CONCAT( "'.$url_order_back.'", wor.id_order) AS url_pedido, 
        ord.current_state AS id_estado,
        IFNULL(osl.name, "Error en pedido") AS estado
        FROM lafrips_webservice_orders wor
        LEFT JOIN lafrips_orders ord ON ord.id_order = wor.id_order
        LEFT JOIN lafrips_order_state_lang osl ON osl.id_order_state = ord.current_state AND osl.id_lang = 1
        WHERE 1 '.
        $where_id_order.
        $where_external_id_order.
        $where_origen.
        $where_estado.
        $where_fecha.        
        $order_by;
        
        if ($pedidos = Db::getInstance()->executeS($sql_order_list)) {            
            //devolvemos la lista 
            die(Tools::jsonEncode(array('message'=>'Lista de pedidos obtenida correctamente', 'info_pedidos' => $pedidos)));
        } else { 
            //error al sacar los pedidos           
            die(Tools::jsonEncode(array('error'=> true, 'message'=>'No hay pedidos o Error obteniendo lista de pedidos')));
            // die(Tools::jsonEncode(array('error'=> true, 'message'=>$sql_order_list)));
        }      
    }
    

    public function ajaxProcessGetOrder() {
        $response = true;

        //recogemos el id del pedido en la tabla lafrips_webservice_orders que viene via ajax  
        $id_webservice_order = Tools::getValue('id_webservice_order',0);
                
        if (!$id_webservice_order) {
            die(Tools::jsonEncode(array('error'=> true, 'message'=>'Se produjo un error al solicitar la información del pedido.')));
        }     

        //obtenemos los datos del pedido, la dirección de entrega y productos que contiene
        $info_pedido = array();

        //primero los datos de una posible respuesta de la API
        $sql_info_pedido_webservice = 'SELECT wor.id_webservice_order AS id_webservice_order, wor.user_name AS user, wor.id_order AS id_order,
        wor.external_id_order AS external_id_order,
        IF(wor.carrier_name = "", "No asignado", wor.carrier_name) AS carrier,
        wor.order_date AS order_date, wor.date_add AS date_add, ord.current_state AS id_estado, ord.valid AS valido,
        IFNULL(osl.name, "Error en pedido") AS estado,
        adr.firstname AS firstname, adr.lastname AS lastname, adr.company AS company, adr.address1 AS address1, adr.address2 AS address2, adr.postcode AS postcode,
        adr.city AS city, adr.phone AS phone, adr.phone_mobile AS phone_mobile, sta.name AS provincia, wor.error AS error
        FROM lafrips_webservice_orders wor        
        LEFT JOIN lafrips_address adr ON adr.id_address = wor.id_address
        LEFT JOIN lafrips_state sta ON sta.id_state = adr.id_state
        LEFT JOIN lafrips_orders ord ON ord.id_order = wor.id_order
        LEFT JOIN lafrips_order_state_lang osl ON osl.id_order_state = ord.current_state AND osl.id_lang = 1
        WHERE wor.id_webservice_order = '.$id_webservice_order;

        $info_pedido_webservice = Db::getInstance()->executeS($sql_info_pedido_webservice);
       
        $info_webservice = array();

        $info_webservice['id_order'] = $info_pedido_webservice[0]['id_order'];
        $info_webservice['id_webservice_order'] = $info_pedido_webservice[0]['id_webservice_order'];
        $info_webservice['user'] = $info_pedido_webservice[0]['user'];
        $info_webservice['external_id_order'] = $info_pedido_webservice[0]['external_id_order'];
        $info_webservice['carrier'] = $info_pedido_webservice[0]['carrier'];
        $info_webservice['order_date'] = $info_pedido_webservice[0]['order_date'];
        $info_webservice['date_add'] = $info_pedido_webservice[0]['date_add'];
        $info_webservice['estado'] = $info_pedido_webservice[0]['estado'];
        $info_webservice['enviado'] = $info_pedido_webservice[0]['id_estado'] == Configuration::get('PS_OS_SHIPPING') ? 1 : 0; //si el id de estado es enviado ponemos 1 a enviado
        $info_webservice['valido'] = $info_pedido_webservice[0]['valido'];
        $info_webservice['firstname'] = $info_pedido_webservice[0]['firstname'];                
        $info_webservice['lastname'] = $info_pedido_webservice[0]['lastname'];
        $info_webservice['company'] = $info_pedido_webservice[0]['company'];
        $info_webservice['address1'] = $info_pedido_webservice[0]['address1'];
        $info_webservice['address2'] = $info_pedido_webservice[0]['address2'];
        $info_webservice['postcode'] = $info_pedido_webservice[0]['postcode'];
        $info_webservice['city'] = $info_pedido_webservice[0]['city'];
        $info_webservice['phone'] = $info_pedido_webservice[0]['phone'];
        $info_webservice['phone_mobile'] = $info_pedido_webservice[0]['phone_mobile'];
        $info_webservice['provincia'] = $info_pedido_webservice[0]['provincia'];
        $info_webservice['error'] = $info_pedido_webservice[0]['error'];        

        $info_pedido['webservice'] = $info_webservice;

        //ahora los datos de productos
        $sql_info_productos = 'SELECT id_product, id_product_attribute, product_name, product_quantity, discount, discount_price
        FROM lafrips_webservice_order_detail
        WHERE id_webservice_order = '.$id_webservice_order;

        $info_productos = Db::getInstance()->executeS($sql_info_productos); 
        
        foreach ($info_productos AS $info_producto) {  
            $producto = array();

            $product_ean_reference = $this->productEan13Reference($info_producto['id_product'], $info_producto['id_product_attribute']);
            $product_ean = $product_ean_reference[0];
            $product_reference = $product_ean_reference[1];

            //sacamos imagen de producto
            $product = new Product((int)$info_producto['id_product'], false, 1, 1);
            $image = Image::getCover((int)$info_producto['id_product']);			
            $image_link = new Link;//because getImageLInk is not static function
            $image_path = $image_link->getImageLink($product->link_rewrite, $image['id_image'], 'home_default');

            $producto['id_product'] = $info_producto['id_product'];      
            $producto['id_product_attribute'] = $info_producto['id_product_attribute'];    
            $producto['ean13'] = $product_ean;     
            $producto['referencia'] = $product_reference;               
            $producto['image_path'] = $image_path;
            $producto['product_name'] = $info_producto['product_name'];            
            $producto['product_quantity'] = $info_producto['product_quantity'];                    
            $producto['discount'] = $info_producto['discount'];
            $producto['discount_price'] = $info_producto['discount_price'];                           

            $info_pedido['productos'][] = $producto;
        }   

        if ($info_pedido) {
            //devolvemos la petición
            die(Tools::jsonEncode(array('info_pedido' => $info_pedido)));
        } else { 
            //error al sacar petición           
            die(Tools::jsonEncode(array('error'=> true, 'message'=>'No se encontraron datos para este pedido')));
        }          
    }

    //función que obtiene el ean y la referencia de un producto dependiendo si es atributo o no
    public function productEan13Reference($id_product, $id_product_attribute) {
        if (!$id_product_attribute) {
            $product = new Product($id_product);

            return array($product->ean13, $product->reference);
        }

        $product_attribute = new Combination($id_product_attribute);

        return array($product_attribute->ean13, $product_attribute ->reference);
    }

}
