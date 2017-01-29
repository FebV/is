const Koa = require('koa2');
const app = new Koa();
const Router = require('koa-router');
const router = new Router();
const bodyParser = require('koa-bodyparser');
app.use(bodyParser());
const auth = require('koa-basic-auth');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/db');


app.use(function *(next){
  try {
    yield next;
  } catch (err) {
    if (401 == err.status) {
      this.status = 401;
      this.set('WWW-Authenticate', 'Basic');
      this.body = '未经过认证!';
    } else {
      throw err;
    }
  }
});
// app.use(auth(require('./data/config')));

app.use(require('koa-static')('./public'));

db.run("CREATE TABLE IF NOT EXISTS inventories (id integer primary key autoincrement, name text, model text, location text, amount integer, remark text)");
db.run("CREATE TABLE IF NOT EXISTS changes (id integer primary key autoincrement, productId int, type text, amount integer, date text, remark text, del text)");

router.get('/api', (ctx, next) => {
    // db.run("select * from inventories");
    ctx.body = 'index';
});

router.get('/api/inventories', async (ctx, next) => {
    let r = null;
    await new Promise((resolve, reject) =>{
        db.all("select id, name, model, location, amount, remark from inventories where del = 'no'", (err, rows) => {
            resolve(rows);
        });
    }).then(rows => {
        r = rows;
    });
    ctx.body = JSON.stringify(r);

})

router.post('/api/inventories', (ctx, next) => {
    const p = invenVali(ctx.request.body);
    db.run(`insert into inventories values(null, '${p.name}', '${p.model}', '${p.location}', '${p.amount}', '${p.remark}', 'no')`);
    ctx.body = 'ok';
})

router.put('/api/inventories/:id', (ctx, next) => {
    const p = ctx.request.body;
    for(let i in p) {
        db.run(`update inventories set '${i}' = '${p[i]}' where id = '${ctx.params.id}'`);
    }
    ctx.body = 'ok';
});

router.del('/api/inventories/:id', (ctx, next) => {
    const p = ctx.params.id;
    if(!p)
        return ctx.body = 'fail';
    db.run(`update inventories set del = 'yes' where id = ${p}`);
    ctx.body = 'ok';
});


router.get('/api/changes', async (ctx, next) => {
    let r = null;
    await new Promise((resolve, reject) =>{
        db.all("select c.id as id, name, model, type, c.amount as amount, date, c.remark as remark from changes as c left join inventories as i on i.id = c.productId where c.del = 'no'", (err, rows) => {
            resolve(rows);
        });
    }).then(rows => {
        r = rows;
    });
    ctx.body = JSON.stringify(r);

})

router.post('/api/changes', (ctx, next) => {
    const p = ctx.request.body;
    if(!(p.amount && p.type && p.productId))
        return ctx.body = 'fail';
    p.remark = p.remark || '空';
    // const d = new Date();
    //const time = (d.getMonth()+1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes();
    db.run(`insert into changes values(null, '${p.productId}', '${p.type}', '${p.amount}', '${p.date}', '${p.remark}', 'no')`);
    db.run(`update inventories set amount = amount + ${p.amount} where id = ${p.productId}`);
    ctx.body = 'ok';
})

router.del('/api/changes/:id', (ctx, next) => {
    const p = ctx.params.id;
    if(!p)
        return ctx.body = 'fail';
    db.run(`update changes set del = 'yes' where id = ${p}`);
    ctx.body = 'ok';
})

// router.put('/api/changes/:id', (ctx, next) => {
//     const p = ctx.request.body;
//     for(let i in p) {
//         db.run(`update inventories set '${i}' = '${p[i]}' where id = '${ctx.params.id}'`);
//     }
//     ctx.body = 'ok';
// })

app.use(router.routes())

app.listen(2000, 'localhost');

function invenVali(param) {
    let obj = {
        name: param.name || '空',
        model: param.model || '空',
        amount: param.amount || 0,
        location: param.location || '空',
        remark: param.remark || '空'
    }
    return obj;
}

function changeVali(param) {
    let obj = {
        date: param.date || '空',
        remark: param.remark || '空'
    }
    return obj;
}