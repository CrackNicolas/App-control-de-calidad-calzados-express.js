import express from "express";
import bodyParser from 'body-parser';
import {engine} from 'express-handlebars';
import flash from 'connect-flash';
import cookieSession from 'cookie-session'

import Session from '../sessiones/index.js';
import log from "./routes/log/index.routes.js";
import errors from './routes/errors/index.routes.js';
import nav from "./routes/nav/index.routes.js";
import linea from './routes/linea/index.routes.js';
import color from './routes/color/index.routes.js';
import modelo from './routes/modelo/index.routes.js';
import turno from './routes/turno/index.routes.js';
import defecto from './routes/defecto/index.routes.js';
import horario_control from './routes/horario_control/index.routes.js';
import inspeccionar_observado from './routes/inspeccionar/observado/index.routes.js';
import inspeccionar_reproceso from './routes/inspeccionar/reproceso/index.routes.js';
import orden_de_produccion from './routes/orden_de_produccion/index.routes.js';
import semaforo from './routes/semaforo/index.routes.js';
import pares_de_primera from './routes/pares_primera/index.routes.js';
import pares_de_segunda from './routes/pares_segunda/index.routes.js';
import pantalla from './routes/pantalla/index.routes.js';

import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Middlewares
app.use(cookieSession({
  name: 'session',
  keys: ["xmen"],
  maxAge: 1 * 60 * 60 * 1000 //1 hora y se vence la session //24 * 60 * 60 * 1000 // 24 horas
}))
app.use(flash());
app.use((req,res,next) => {
  res.locals.mensaje = req.flash('mensaje');
  res.locals.color = (res.locals.mensaje.toString().split(" ")[res.locals.mensaje.toString().split(" ").length-1] == "exito")? "#00ffff" : "#ff0000";
  next();
});

app.use(express.static(path.join(__dirname,'styles')));

app.set('views', __dirname + '/views');
app.engine('.hbs', engine({extname: '.hbs'}));
app.set('view engine','hbs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Routes
app.use("/log", log);
app.use("/nav", Session.Comprobar_session, nav);
app.use('/linea', Session.Comprobar_session, linea);
app.use('/color', Session.Comprobar_session, color);
app.use('/modelo', Session.Comprobar_session, modelo);
app.use('/turno', Session.Comprobar_session, turno);
app.use('/defecto', Session.Comprobar_session, defecto);
app.use('/horario_control', Session.Comprobar_session, horario_control);
app.use('/inspeccionar/observado', Session.Comprobar_session, inspeccionar_observado);
app.use('/inspeccionar/reproceso', Session.Comprobar_session, inspeccionar_reproceso);
app.use('/orden_de_produccion', Session.Comprobar_session, orden_de_produccion);
app.use("/semaforo", Session.Comprobar_session, semaforo);
app.use("/pares_primera", Session.Comprobar_session, pares_de_primera);
app.use("/pares_segunda", Session.Comprobar_session, pares_de_segunda);
app.use("/pantalla", Session.Comprobar_session, pantalla);
app.use("/errors", errors);

app.get(/[a-zA-Z0-9]/, (req,res) => {
  res.render("errors/page_404");
});
app.get('/', (req,res) => {
  res.render("log/iniciar")
});

export default app;