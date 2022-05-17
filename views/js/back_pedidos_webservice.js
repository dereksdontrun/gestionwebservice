/**
* 2007-2022 PrestaShop
*
* NOTICE OF LICENSE
*
* This source file is subject to the Academic Free License (AFL 3.0)
* that is bundled with this package in the file LICENSE.txt.
* It is also available through the world-wide-web at this URL:
* http://opensource.org/licenses/afl-3.0.php
* If you did not receive a copy of the license and are unable to
* obtain it through the world-wide-web, please send an email
* to license@prestashop.com so we can send you a copy immediately.
*
* DISCLAIMER
*
* Do not edit or add to this file if you wish to upgrade PrestaShop to newer
* versions in the future. If you wish to customize PrestaShop for your
* needs please refer to http://www.prestashop.com for more information.
*
*  @author    PrestaShop SA <contact@prestashop.com>
*  @copyright 2007-2022 PrestaShop SA
*  @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
*  International Registered Trademark & Property of PrestaShop SA
*
* Don't forget to prefix your containers with your own identifier
* to avoid any conflicts with others containers.
*/

//para mostrar el botón de scroll arriba, aparecerá cuando se haga scroll abajo y desaparecerá al volver arriba
$(window).scroll(function(){    
    if ($(this).scrollTop() > 400) {
      $('#boton_scroll').fadeIn();
    } else {
      $('#boton_scroll').fadeOut();
    }
});

document.addEventListener('DOMContentLoaded', start);

function start() {
    //quitamos cosas del panel header que pone Prestashop por defecto, para que haya más espacio. 
    document.querySelector('h2.page-title').remove(); 
    document.querySelector('div.page-bar.toolbarBox').remove(); 
    document.querySelector('div.page-head').style.height = '36px';  
    
    //el panel que contiene el formulario, etc donde aparecerá el contenido lo hacemos relative y colocamos para que aparezca inicialmente bajo el panel superior, poniendo top -80px ¿?
    const panel_contenidos = document.querySelector('div#content div.row'); 
    panel_contenidos.style.position = 'relative';
    panel_contenidos.style.top = '-80px';    

    //al div con id fieldset_0 que viene a contener todo esto, le añadimos clase clearfix para que la tabla etc quede siempre dentro
    const panel_fieldset_0 = document.querySelector('div#fieldset_0'); 
    panel_fieldset_0.classList.add('clearfix');    

    // obtenemos token del input hidden que hemos creado con id 'token_admin_modulo_'.$token_admin_modulo, para ello primero buscamos el id de un input cuyo id comienza por token_admin_modulo y al resultado le hacemos substring.  
    const id_hiddeninput = document.querySelector("input[id^='token_admin_modulo']").id;    

    //substring, desde 19 hasta final(si no se pone lenght coge el resto de la cadena)
    const token = id_hiddeninput.substring(19);
    // console.log('token = '+token);

    //vamos a añadir un panel para visualizar los pedidos, llamado div_pedidos, lo creamos y ponemos adjunto antes que la tabla, de modo que se desplaza a la derecha al poner el panel de tabla
    //div para mostrar los pedidos
    const div_pedidos = document.createElement('div');
    div_pedidos.classList.add('clearfix','col-lg-7');
    div_pedidos.id = 'div_pedidos';
    document.querySelector('div.panel-heading').insertAdjacentElement('afterend', div_pedidos);

    //generamos la tabla "vacia" para los resultados de las consultas
    //utilizamos el mismo formato de prestashop para mostrar los productos, con tabla responsiva etc.
    //div contenedor de la tabla
    const div_tabla = document.createElement('div');
    div_tabla.classList.add('table-responsive-row','clearfix','col-lg-5');
    div_tabla.id = 'div_tabla';
    document.querySelector('div.panel-heading').insertAdjacentElement('afterend', div_tabla);    

    //generamos tabla
    const tabla = document.createElement('table');
    tabla.classList.add('table');
    tabla.id = 'tabla';
    document.querySelector('#div_tabla').appendChild(tabla);

    //generamos head de tabla
    const thead = document.createElement('thead');
    thead.id = 'thead';
    thead.innerHTML = `
        <tr class="nodrag nodrop" id="tr_campos_tabla">
            <th class="fixed-width-xs row-selector text-center">
                <input class="noborder" type="checkbox" name="selecciona_todos_pedidos" id="selecciona_todos_pedidos">
            </th>  
            <th class="fixed-width-sm center">
                <span class="title_box">ID WS                    
                </span>
            </th>          
            <th class="fixed-width-sm center">
                <span class="title_box active">ID
                    <a id="orden_id_abajo" class="filtro_orden"><i class="icon-caret-down"></i></a>
                    <a id="orden_id_arriba" class="filtro_orden"><i class="icon-caret-up"></i></a>
                </span>
            </th>    
            <th class="fixed-width-xl text-center">
                <span class="title_box">ID Externo
                </span>
            </th>        
            <th class="fixed-width-xl text-center">
                <span class="title_box">Origen
                </span>
            </th>
            <th class="fixed-width-xl text-center">
                <span class="title_box">Estado
                </span>
            </th>                                     
            <th class="fixed-width-sm text-center">
                <span class="title_box">Fecha
                    <a id="orden_fecha_abajo" class="filtro_orden"><i class="icon-caret-down"></i></a>
                    <a id="orden_fecha_arriba" class="filtro_orden"><i class="icon-caret-up"></i></a>
                </span>
            </th>            
            <th></th>
            <th></th>
        </tr>
        <tr class="nodrag nodrop filter row_hover">
            <th class="text-center">--</th>
            <th class="text-center">--</th>
            <th class="text-center"><input type="text" class="filter" id="filtro_id_order" value=""></th> 
            <th class="text-center"><input type="text" class="filter" id="filtro_external_id_order" value=""></th> 
            <th class="text-center">
                <select class="filter center"  name="filtro_origen" id="filtro_origen">                                                                                       
                </select>
            </th>            
            <th class="text-center">
                <select class="filter center" name="filtro_estado"  id="filtro_estado">                                                                                        
                </select>
            </th>              
            <th class="text-right">
				<div class="row">
                    <div class="input-group fixed-width-md center">
                        <input class="input_date" id="filtro_desde" type="text" placeholder="Desde" name="pedidos_desde" value="" min="1997-01-01" max="2030-12-31" onfocus="(this.type='date')" onblur="if(this.value==''){this.type='text'}"> 
                    </div>
                    <div class="input-group fixed-width-md center">
                        <input class="input_date" id="filtro_hasta" type="text" placeholder="Hasta" name="pedidos_hasta" value="" min="1997-01-01" max="2030-12-31" onfocus="(this.type='date')" onblur="if(this.value==''){this.type='text'}">                        
                    </div>										
                </div>
			</th>                        
            <th class="text-center"></th>
            <th class="text-center"></th>
        </tr>
        `; 
    document.querySelector('#tabla').appendChild(thead);

    //los inputs de fecha en lugar de type date, que obliga a placeholder tipo dd-mm-yyyy los pongo type text, que permite cambiar placeholder, y añadimos un onfocus que lo cambia a type date y un onblur, que si su value es '' lo devuelve a type text al salir el ratón

    //llamamos a función para rellenar select de usuarios origen del webservice
    obtenerOrigen();
    //llamamos a función para rellenar select de estados de pedido del webservice
    obtenerEstados();

    //añadimos eventlistener a las flechas de ordenar (id de producto, fechas.. que tienen clase común filtro_orden)
    const flechas_ordenar = document.querySelectorAll('.filtro_orden');

    flechas_ordenar.forEach( item => {
        item.addEventListener('click', buscarOrdenado); 
    });

    //añadimos event listener para el input de id_order, para cuando se escriba y se pulse Enter
    document.querySelector('#filtro_id_order').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            //llamamos a buscarOrdenado, que recogerá lo que hayamos introducido en el input. Esto entra como valor flechaid, pero no importa porque el controlador luego desecha el contenido
            buscarOrdenado(e);
        }
    });

    //añadimos event listener para el input de external_id_order, para cuando se escriba y se pulse Enter
    document.querySelector('#filtro_external_id_order').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            //llamamos a buscarOrdenado, que recogerá lo que hayamos introducido en el input. Esto entra como valor flechaid, pero no importa porque el controlador luego desecha el contenido
            buscarOrdenado(e);
        }
    });

    //añadimos event listener para el select de usuario origen, para cuando se cambia
    document.querySelector('#filtro_origen').addEventListener('change', function (e) {        
        //llamamos a buscarOrdenado, que recogerá lo que tengamos en select e inputs. Esto entra como valor flechaid, pero no importa porque el controlador luego desecha el contenido
        buscarOrdenado(e);        
    });

    //añadimos event listener para el select de estado, para cuando se cambia
    document.querySelector('#filtro_estado').addEventListener('change', function (e) {        
        //llamamos a buscarOrdenado, que recogerá lo que tengamos en select e inputs. Esto entra como valor flechaid, pero no importa porque el controlador luego desecha el contenido
        buscarOrdenado(e);        
    });

    //generamos el botón para subir hasta arriba haciendo scroll
    const boton_scroll = document.createElement('div');    
    boton_scroll.id = "boton_scroll";
    boton_scroll.innerHTML =  `<i class="icon-arrow-up"></i>`;

    boton_scroll.addEventListener('click', scrollArriba);

    //lo append al panel, y con css lo haremos fixed
    div_pedidos.appendChild(boton_scroll);

    obtenerPedidosWebservice();

}
//función para subir cuando se pulsa el botón de scroll arriba
function scrollArriba() {
    $('html, body').animate({scrollTop : 0},1000);
    // return false;
}

//función que llena el select de usuarios origen del webservice
function obtenerOrigen() {
    var dataObj = {};

    //el token lo hemos sacado arriba del input hidden
    $.ajax({
        url: 'index.php?controller=AdminWebserviceOrders' + '&token=' + token + "&action=get_users" + '&ajax=1' + '&rand=' + new Date().getTime(),
        type: 'POST',
        data: dataObj,
        cache: false,
        dataType: 'json',
        success: function (data, textStatus, jqXHR)
        
        {
            if (typeof data.error === 'undefined')
            {                
                //recibimos via ajax un array con los datos para el select correspondiente
                // console.dir(data.contenido_select); 
                const contenido_select = data.users_info;       
                
                const select = document.querySelector('#filtro_origen');
                
                //vaciamos los select
                select.innerHTML = '';    

                var options_select = '<option value="0" selected> - </option>'; //permitimos un valor nulo, que si es seleccionado no aplica filtro    
                                
                contenido_select.forEach(
                    webservice_user => {                        
                        options_select += '<option value="'+webservice_user.id_webservice_user+'">'+webservice_user.user+'</option>';
                    }
                );
                
                // console.log(options_select);
                select.innerHTML = options_select;                           
                
            }
            else
            {      
                showErrorMessage(data.message);
            }

        },
        error: function (jqXHR, textStatus, errorThrown)
        {
            showErrorMessage('ERRORS: ' + textStatus);
        }
    });  //fin ajax

}

//función que llena el select de estados de pedido del webservice. Mostrará los estados en los que haya al menos un pedido
function obtenerEstados() {
    var dataObj = {};

    //el token lo hemos sacado arriba del input hidden
    $.ajax({
        url: 'index.php?controller=AdminWebserviceOrders' + '&token=' + token + "&action=get_order_states" + '&ajax=1' + '&rand=' + new Date().getTime(),
        type: 'POST',
        data: dataObj,
        cache: false,
        dataType: 'json',
        success: function (data, textStatus, jqXHR)
        
        {
            if (typeof data.error === 'undefined')
            {                
                //recibimos via ajax un array con los datos para el select correspondiente
                // console.dir(data.contenido_select); 
                const contenido_select = data.estados_info;       

                //generamos el select y lo ponemos en su sitio
                const select_estados = document.querySelector('#filtro_estado');
                            
                //vaciamos el select si tiene algo
                select_estados.innerHTML = '';    

                var options_select_estados = '<option value="0" selected> - </option>'; //permitimos un valor nulo, que si es seleccionado no aplica filtro    
                                
                contenido_select.forEach(
                    el_estado => {                        
                        options_select_estados += '<option value="'+el_estado.id_estado+'">'+el_estado.estado+'</option>';
                    }
                );
                    
                select_estados.innerHTML = options_select_estados; 

            }
            else
            {      
                showErrorMessage(data.message);
            }

        },
        error: function (jqXHR, textStatus, errorThrown)
        {
            showErrorMessage('ERRORS: ' + textStatus);
        }
    });  //fin ajax

}

//función que hace la llamada a obtenerPedidosWebservice() asignando el filtro de ordenar correspondiente a la flecha pulsada
function buscarOrdenado(e) { 
    //obtenemos el id de la flecha pulsada que define como se ordenará la búsqueda. Si la llamada procede de pulsar el Enter en un input o utilizar un select, no importa ya que en el controlador, si el valor no es flecha tal arriba o abajo, ignora lo que ponga, y el value del input o select se recoge aquí., sacamos el contenido de los inputs y select de abajo si tienen algo y lo enviamos todo como parámetro a la función obtenerPedidosWebservice() que hará la llamada ajax
    const flechaId = e.currentTarget.id;      
    const busqueda_id_order = document.querySelector('#filtro_id_order').value;   
    const busqueda_external_id_order = document.querySelector('#filtro_external_id_order').value;    
    const busqueda_origen = document.querySelector('#filtro_origen').value;  
    const busqueda_estado = document.querySelector('#filtro_estado').value; 
    const busqueda_fecha_desde = document.querySelector('#filtro_desde').value; 
    const busqueda_fecha_hasta = document.querySelector('#filtro_hasta').value; 

    // console.log(flechaId); 
    // console.log(busqueda_id);
    // console.log(busqueda_proveedor);  
    // console.log(busqueda_estado);
    // console.log(busqueda_fecha_desde);
    // console.log(busqueda_fecha_hasta);
        
    obtenerPedidosWebservice(busqueda_id_order, busqueda_external_id_order, busqueda_origen, busqueda_estado, busqueda_fecha_desde, busqueda_fecha_hasta, flechaId);
    
}

function obtenerPedidosWebservice(id_order = 0, external_id_order = 0, origen = 0, estado = 0, busqueda_fecha_desde = '', busqueda_fecha_hasta = '', orden = '') {
    // console.log('obtenerPedidosWebservice');  
    //ante cualquier búsqueda, si hay algo en el panel lateral limpiamos    
    if (document.contains(document.querySelector('#div_pedido'))) {
        document.querySelector('#div_pedido').remove();
    } 

    //mostramos spinner
    // Spinner();

    const buscar_id_order = id_order;
    const buscar_external_id_order = external_id_order;
    const buscar_origen = origen;
    const buscar_estado = estado;    
    const buscar_pedidos_desde = busqueda_fecha_desde;
    const buscar_pedidos_hasta = busqueda_fecha_hasta;
    const ordenar = orden;

    //vamos a hacer una petición ajax a la función ajaxProcessGetOrderList en el controlador AdminWebserviceOrders que nos devuelva la lista de pedidos de la tabla lafrips_webservice_orders
    var dataObj = {};

    dataObj['buscar_id_order'] = buscar_id_order;
    dataObj['buscar_external_id_order'] = buscar_external_id_order;
    dataObj['buscar_origen'] = buscar_origen;
    dataObj['buscar_estado'] = buscar_estado;  
    dataObj['buscar_pedidos_desde'] = buscar_pedidos_desde;  
    dataObj['buscar_pedidos_hasta'] = buscar_pedidos_hasta;    
    dataObj['ordenar'] = ordenar;

    // console.dir(dataObj);
    //el token lo hemos sacado arriba del input hidden
    $.ajax({
        url: 'index.php?controller=AdminWebserviceOrders' + '&token=' + token + "&action=get_order_list" + '&ajax=1' + '&rand=' + new Date().getTime(),
        type: 'POST',
        data: dataObj,
        cache: false,
        dataType: 'json',
        success: function (data, textStatus, jqXHR)
        
        {
            if (typeof data.error === 'undefined')
            {                
                //recibimos via ajax en data.info_pedidos la información de los pedidos
                // console.log('data.info_pedidos = '+data.info_pedidos);
                // console.dir(data.info_pedidos);     

                //con los datos, llamamos a la función que nos los mostrará
                muestraListaPedidos(data.info_pedidos); 

                //eliminamos spinner
                // if (document.contains(document.querySelector('#spinner'))) {
                //     document.querySelector('#spinner').remove();
                // }

            }
            else
            {                    
                //eliminamos spinner
                // if (document.contains(document.querySelector('#spinner'))) {
                //     document.querySelector('#spinner').remove();
                // }

                //limpiamos tabla
                if (document.contains(document.querySelector('#tbody'))) {
                    document.querySelector('#tbody').remove();
                }

                showErrorMessage(data.message);
                console.log(data.message);
            }

        },
        error: function (jqXHR, textStatus, errorThrown)
        {
            showErrorMessage('ERRORS: ' + textStatus);
        }
    });  //fin ajax
       
}

function muestraListaPedidos(pedidos) {
    //primero limpiamos el tbody
    if (document.contains(document.querySelector('#tbody'))) {
        document.querySelector('#tbody').remove();
    } 
    //generamos el tbody con los pedidos obtenidos, que insertaremos tras el thead
    const tbody = document.createElement('tbody');
    tbody.id = 'tbody';
    var num_pedidos = 0;
    var estados = [];
    //por cada pedido, generamos un tr que hacemos appenchild a tbody
    pedidos.forEach(
        pedido => {
            num_pedidos++;        
            
            //color a poner, verde si está enviado, rojo si no válido, naranja el resto
            if (pedido.color == 1) {
                //enviado 
                var color_pedido = 'enviado';
            } else if (pedido.color == 2) {
                //recibido, en pago aceptado a distancia
                var color_pedido = 'recibido';
            } else if (pedido.color == 3) {                
                //en procesos 
                var color_pedido = 'en_proceso';
            } else {
                //error o cancelado
                var color_pedido = 'no_valido';
            }

            var tr_pedido = document.createElement('tr');
            tr_pedido.id = 'tr_'+pedido.id_webservice_order;
            tr_pedido.innerHTML = `
                <td class="row-selector text-center">
                    <input class="noborder checks_linea_pedido" type="checkbox" name="orderBox[]" value="${pedido.id_webservice_order}">
                </td>
                <td class="fixed-width-sm center">
                    ${pedido.id_webservice_order} 
                </td>
                <td class="fixed-width-sm center">
                    ${pedido.id_order} 
                </td>
                <td class="fixed-width-xl center">
                    ${pedido.external_id_order}
                </td>
                <td class="fixed-width-xl center">
                    ${pedido.user} 
                </td>
                <td class="fixed-width-xl center ${color_pedido}">
                    ${pedido.estado}                                        
                </td>                
                <td class="fixed-width-sm center">
                    ${pedido.date_add} 
                </td>                    
                <td class="text-right"> 
                    <div class="btn-group pull-right">
                        <a href="${pedido.url_pedido}" target="_blank" class="btn btn-default" title="Ir a pedido">
                            <i class="icon-wrench"></i> Ir
                        </a>    
                    </div> 
                </td>
                <td class="text-right"> 
                    <div class="btn-group pull-right">
                        <button class="btn btn-default ver_pedido" type="button" title="Ver pedido" id="ver_${pedido.id_webservice_order}" name="ver_${pedido.id_webservice_order}">
                            <i class="icon-search-plus"></i> Ver
                        </button>    
                    </div>           
                </td>
            `;

            tbody.appendChild(tr_pedido);

        }     
    ) 

    // console.log(estados);
    //tenemos los diferentes estados de pedido como objetos en array estados, ordenamos por orden alfabético con esta función sort()
    // estados.sort((a, b) => {
    //     let fa = a.estado.toLowerCase(),
    //         fb = b.estado.toLowerCase();

    //     if (fa < fb) {
    //         return -1;
    //     }
    //     if (fa > fb) {
    //         return 1;
    //     }
    //     return 0;
    // });

    //añadimos al texto de panel-heading el número de productos mostrados   
    document.querySelector('.panel-heading').innerHTML = '<i class="icon-pencil"></i> PEDIDOS WEBSERVICE - ' + num_pedidos;    
    
    //ponemos tbody en la tabla
    document.querySelector('#tabla').appendChild(tbody);

    //añadimos event listener para cada botón de Ver, que llamará a la función para mostrar el contenido del pedido Webservice
    const botones_ver_pedido = document.querySelectorAll('.ver_pedido');

    botones_ver_pedido.forEach( item => {
        item.addEventListener('click', mostrarPedido);             
    });
    
    //añadimos eventlistener a cada check de producto, si se marca se hará enabled el input de propuesta de compra, y sino se hara disabled   
    // document.querySelectorAll('.checks_linea_producto').forEach( item => {
    //     item.addEventListener('change', enableInputPropuesta); 
    // });
} 

//función que trae id_order y supplier para buscar los datos del pedido y mostrarlos en el lateral
function mostrarPedido(e) {
    console.log('mostrar pedido');
    //primero limpiamos el div id div_pedidos
    if (document.contains(document.querySelector('#div_pedido'))) {
        document.querySelector('#div_pedido').remove();
    } 

    //usamos currentTarget en lugar de target, ya que si se pulsa sobre el icono del botón lo interpreta como target, no teniendo la clase que buscamos, ni el id, etc. Con currentTarget, se va hacia arriba buscando el disparador del event listener
    if(e.currentTarget && e.currentTarget.classList.contains('ver_pedido')){                    
        //para sacar el id_webservice_order, cogemos el id del botón pulsado y separamos por _        
        var botonId = e.currentTarget.id;
        var splitBotonId = botonId.split('_');
        var id_webservice_order = splitBotonId[splitBotonId.length - 1];     
        
        console.log(id_webservice_order);       
        
        // //mostramos spinner
        // Spinner();

        var dataObj = {};
        dataObj['id_webservice_order'] = id_webservice_order;
        //el token lo hemos sacado arriba del input hidden
        $.ajax({
            url: 'index.php?controller=AdminWebserviceOrders' + '&token=' + token + "&action=get_order" + '&ajax=1' + '&rand=' + new Date().getTime(),
            type: 'POST',
            data: dataObj,
            cache: false,
            dataType: 'json',
            success: function (data, textStatus, jqXHR)
            
            {
                if (typeof data.error === 'undefined')
                {                                 
                    console.dir(data.info_pedido);     
                    
                    
                    muestraPedido(data.info_pedido);

                    //eliminamos spinner
                    // if (document.contains(document.querySelector('#spinner'))) {
                    //     document.querySelector('#spinner').remove();
                    // }

                }
                else
                {                    
                    //eliminamos spinner
                    // if (document.contains(document.querySelector('#spinner'))) {
                    //     document.querySelector('#spinner').remove();
                    // }

                    showErrorMessage(data.message);
                }

            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                showErrorMessage('ERRORS: ' + textStatus);
            }
        });  //fin ajax
    }
}

//función para mostrar los datos de pedido. Arriba pondremos un alert-secondary con la dirección de entrega junto a otro con los datos generales del pedido, en danger si el pedido no tiene valid 1, en warning si está sin enviar en proceso, en success si está en pago a distancia aceptado y en azul primary si está enviado. Debajo la lista de productos que contiene.
function muestraPedido(info) {
    // console.log('muestraPedido');    

    const div_pedido = document.createElement('div');
    div_pedido.classList.add('clearfix','panel_sticky');
    div_pedido.id = 'div_pedido';
    document.querySelector('div#div_pedidos').appendChild(div_pedido);

    //color a poner, verde si está enviado, rojo si no válido, naranja el resto
    if (info.webservice.color == 1) {
        //enviado 
        var badge = 'info';
    } else if (info.webservice.color == 2) {
        //recibido, en pago aceptado a distancia
        var badge = 'success';
    } else if (info.webservice.color == 3) {                
        //en procesos 
        var badge = 'warning';
    } else {
        //error o cancelado
        var badge = 'danger';
    }    

    var info_general = `
        <div class="col-lg-8"> 
        <div class="alert alert-${badge} clearfix">
            <b>INFORMACIÓN</b><br>         
            <em>Origen pedido:</em> ${info.webservice.user}<br>
            <em>Id pedido Webservice:</em> ${info.webservice.id_webservice_order}<br>
            <em>Id pedido Origen:</em> ${info.webservice.external_id_order}<br>
            <em>Fecha pedido origen:</em> ${info.webservice.order_date}<br>  
            <em>Fecha pedido aceptado:</em> ${info.webservice.date_add}<br>   
            <em>Estado:</em> ${info.webservice.estado}<br>`;  

    //si está enviado se ponen los datos de envío
    if (info.webservice.shipping !== 0) {
        if (typeof info.webservice.shipping === "object") { //si no viene un objeto con la ingo y no era 0  es que no se obtuvo la info
            info_general += `
                <b>Envío:</b> <br>
                <div class="info_envio"> 
                <em>Fecha:</em> ${info.webservice.shipping.fecha_enviado}<br>
                <em>Transporte:</em> ${info.webservice.shipping.carrier}<br>
                <em>Tracking:</em> ${info.webservice.shipping.tracking}<br>
                <em>Seguimiento:</em><br> ${info.webservice.shipping.url}<br>       
                </div>            
            `;
        } else {
            //hubo error y llega mensaje
            info_general += `
                <b>Envío:</b> <br>
                <div class="info_envio"> 
                    Error obteniendo datos de transporte<br>
                </div>
            `;
        }
    }
            
    info_general += `
            </div>
        </div>
        `;
    

    var info_address = `
        <div class="col-lg-4"> 
        <div class="alert alert-secondary clearfix color_secondary">
            <b>DIRECCIÓN ENTREGA</b><br>
            ${info.webservice.firstname} ${info.webservice.lastname}<br>`;

    if (info.webservice.company != '') {
        info_address += `        
        ${info.webservice.company}<br>`;
    }

    info_address += `  
        ${info.webservice.address1}<br>`;

    if (info.webservice.address2 != '') {
        info_address += `  
        ${info.webservice.address2}<br>`;
    }

    info_address += `    
        ${info.webservice.phone_mobile} ${info.webservice.phone}<br>
        ${info.webservice.postcode} ${info.webservice.city}<br>
        ${info.webservice.provincia}<br>
        ${info.webservice.country}<br>
        </div>
        </div>
        `;

    //sacamos los productos, si han llegado
    if (info.productos) {
        var productos = `
        <div class="table-responsive">
        <table class="table" id="productos_dropshipping_{$proveedor.id_supplier}">
            <thead>
            <tr>
                <th></th>
                <th><span class="title_box">Producto</span></th>
                <th>
                <span class="title_box">Referencia</span>
                <small class="text-muted">Prestashop</small>
                </th>
                <th>
                <span class="title_box text-center">Ean 13</span>                
                </th>                
                <th>
                <span class="title_box">Cantidad<br>Solicitada</span>              
                </th>
                <th>
                <span class="title_box text-center">Descuento<br>%</span>              
                </th>
                <th>
                <span class="title_box text-center">Precio<br><small class="text-muted">descuento</small></span>                              
                </th>                		
                <th></th>
            </tr>
            </thead>
            <tbody>
        `;

        info.productos.forEach(
            producto => {                
                var prod = `
                <tr>
                <td><img src="https://${producto.image_path}" alt="" title="${producto.id_product}_${producto.id_product_attribute}" class="imgm img-thumbnail" height="49px" width="45px"></td>
                <td>${producto.product_name}</td>
                <td>${producto.referencia}</td>
                <td>${producto.ean13}</td>
                <td class="text-center">${producto.product_quantity}</td>
                <td class="text-center">${producto.discount}</td>
                <td class="text-center">${producto.discount_price}</td>                                
                </tr>
                `;

                productos += prod;

            }
        );

        productos += `
                </tbody>
            </table>
        </div>
        `;

    } else {
        var productos = `
        <div class="alert alert-danger">          
            No encontrados productos                       
        </div>`;
    }

    div_pedido.innerHTML = `
        <div class="panel">                        
            <h3>Origen: ${info.webservice.user} - Id: ${info.webservice.id_order} - ${info.webservice.estado}</h3> 
            <div class="row">
                ${info_general}
                ${info_address}        
            </div>
            <div class="row">
                ${productos}         
            </div>
        </div>
    `;
}
