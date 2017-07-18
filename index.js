var express = require('express');
var promise = require('bluebird');
var util = require('util');

var bodyParser = require('body-parser')


var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);

const cn = {
    host: 'localhost', // 'localhost' is the default;
    port: 5432, // 5432 is the default;
    database: 'clientes',
    user: 'postgres',
    password: 'admin',
    poolSize:10
};
// You can check for all default values in:
// https://github.com/brianc/node-postgres/blob/master/lib/defaults.js

const db = pgp(cn); // database instance;

var app = express();

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

//GET consulta de todos los clientes
app.get('/api/clientes', function (req, res,next) {
  db.any('select * from clientes')
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retorna todos los clientes'
        });
    })
    .catch(function (err) {
      return next(err);
    });
});

//GET consulta de cliente por id
app.get('/api/clientes/:id', function (req, res, next) {
  var pupID = parseInt(req.params.id);
  db.one('select * from clientes where cli_id = $1', pupID)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retorna un solo cliente por eso se usa db.one'
        });
    })
    .catch(function (err) {
      return next(err);
    });
});

//POST Crear clientes
app.post('/api/clientes', function (req, res, next) {
  req.body.cli_id = parseInt(req.body.cli_id);
  req.body.tdoc_codigo = parseInt(req.body.tdoc_codigo);
  db.none('INSERT INTO clientes(cli_id, tdoc_codigo, cli_nombre, cli_direccion, cli_telefono,cli_mail)VALUES(${cli_id}, ${tdoc_codigo}, ${cli_nombre}, ${cli_direccion}, ${cli_telefono},${cli_mail})',
    req.body)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Inserta un cliente'
        });
    })
    .catch(function (err) {
      return next(err);
    });
});

app.put('/api/clientes/:id', function (req, res, next) {
 
  db.none('UPDATE clientes SET tdoc_codigo=$1, cli_nombre=$2, cli_direccion=$3, cli_telefono=$4,cli_mail=$5 WHERE cli_id=$6',[parseInt(req.body.tdoc_codigo), req.body.cli_nombre, req.body.cli_direccion, req.body.cli_telefono,req.body.cli_mail,parseInt(req.param.id)])
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Actualiza un cliente'
        });
    })
    .catch(function (err) {
      return next(err);
    });
});

app.delete('/api/clientes/:id', function (req, res, next) {
  var cliId = parseInt(req.params.id);
  db.result('delete from clientes where cli_id = $1', cliId)
    .then(function (result) {
      res.status(200)
        .json({
          status: 'success',
          message: 'Borro ${result.rowCount} clientes'
        });
    })
    .catch(function (err) {
      return next(err);
    });
});

app.listen(3000, function () {
  console.log('Server port 3000!')
})
