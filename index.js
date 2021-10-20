// Сервер на JS
const HTTP_PORT = 88 ;

// Подключение модуля
const http = require( "http" ) ;

// Серверная функция
function serverFunction( request, response ) {
    console.log( request.method + " " + request.url ) ;
    const url = request.url.substring(1) ;
    if( url == '' || url == 'hello.js' ) {
        response.statusCode = 200 ;
        response.setHeader( 'Content-Type', 'text/html' ) ;
        response.end( "<h1>Server works</h1>" ) ;  // ~getWriter().print
    } else {
        response.statusCode = 404 ;
        response.setHeader( 'Content-Type', 'text/html' ) ;
        response.end( "<h1>Not Found</h1>" ) ;
    }
}

// Создание сервера (объект)
const server = http.createServer( serverFunction ) ;

// Запуск сервера - начало прослушивания порта
server.listen(  // регистрируемся в ОС на получение 
                // пакетов, адрессованных на наш порт 
    HTTP_PORT,  // номер порта
    () => {  // callback, после-обработчик, вызывается
             // после того, как "включится слушание"
        console.log( "Listen start, port " + HTTP_PORT ) ; 
    } 
) ;