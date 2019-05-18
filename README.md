# werpi

This project is generated with [yo angular generator](https://github.com/yeoman/generator-angular)
version 0.11.1.

## Build & development

Run `grunt` for building and `grunt serve` for preview.

## Testing

Running `grunt test` will run the unit tests with karma.

## Evitar CORS

Para evitar CORS se puede descargar un plugin para chrome: https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi/support

En el plugin agregar en cabeceras: Access-Control-Allow-Origin
Y limitar que funcione SÓLO para: 
```
https://test.werpi.com/*
```

Eliminar la ruta 
``` 
*://*/* 
```
ya que esta ruta le agrega la cabecera Access-Control-Allow-Origin a todas las respuestas. y en el caso de Mercadopago, esta cabecera YA existe. Y entonces el browser tambien da error de que la cabecera está repetida.



