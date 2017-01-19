const Koa = require('koa2');
const app = new Koa();
const Router = require('koa-router');
const router = new Router();
const fs = require('fs');
const bodyParser = require('koa-bodyparser');
app.use(bodyParser());

// class List {
//     constructor(name) {
//         this.name = name;
//         this.list = [];
//         try {
//             fs.accessSync(`data/${this.name}.json`)
//             const res = fs.readFileSync(`data/${this.name}.json`, 'utf-8');
//             if(res)
//                 this.list = JSON.parse(res);
//         }
//         catch(e){}
//     }

//     add(obj) {
//         this.list.push(obj);
//         fs.writeFileSync(`data/${this.name}.json`, JSON.stringify(this.list));
//         return 'ok';
//     }

//     update(id, obj) {
//         if(id > this.list.length)
//             return 'fail';
//         this.list = this.list.map((val, index) => {
//             if(index + 1 == id)
//                 return obj;
//             return val;
//         });
//         fs.writeFileSync(`data/${this.name}.json`, JSON.stringify(this.list));
//         return 'ok';
//     }

//     change(id, num) {
//         if(id > this.list.length)
//             return 'fail';
//         this.list = this.list.map((val, index) => {
//             if(index + 1 == id)
//                 val.amount += num;
//             return val;
//         });
//         fs.writeFileSync(`data/${this.name}.json`, JSON.stringify(this.list));
//         return 'ok';
//     }

//     getAll() {
//         let recur = this.list.map((val, index) => {
//             val.id = index + 1;
//             return val;
//         })
//         return recur;
//     }
// }

function vali(param) {
    let obj = {
        name: param.name || '空',
        model: param.model || '空',
        cap: param.cap || '空',
        amount: param.amount || '空',
        location: param.location || '空',
        remark: param.remark || '空'
    }
    return obj;

}

let invenList = new List('inven');
let changeList = new List('change');

// response
router.get('/', (ctx, next) => {
    ctx.body = 'index';
});

router.get('/api', (ctx, next) => {
    ctx.body = 'api index';
})

router.get('/api/inven', (ctx, next) => {
    const re = invenList.getAll();
    ctx.body = re;
})

router.post('/api/inven', (ctx, next) => {
    const param = ctx.request.body;
    const obj = vali(param);
    ctx.body = invenList.add(obj);
    
})

router.put('/api/inven/:id', (ctx, next) => {
    const id = ctx.params.id;
    ctx.body = invenList.update(id, vali(ctx.request.body));
})

router.get('/api/change', (ctx, next) => {
    const re = changeList.getAll();
    ctx.body = re;
})

router.post('/api/change', (ctx, next) => {
    const param = ctx.request.body;
    const obj = vali(param);
    invenList.change()
    ctx.body = changeList.add(obj);
})

router.put('/api/change/:id', (ctx, next) => {
    const id = ctx.params.id;
    ctx.body = changeList.update(id, vali(ctx.request.body));
})


app.use(router.routes())

app.listen(3000);
