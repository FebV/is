var superObj = {};

function setHead(heads) {
    var html = '<tr style="text-align:center;font-size:25px">';
    for(var i = 0; i < heads.length; i++) {
        if(i == 0)
            html += '<th width="80px" style="font-size:25px">' + heads[i] + '</th>';
        else if(i == 1)
            html += '<th width="300px" style="text-align:center;font-size:25px">' + heads[i] + '</th>';
        else if(i == 4)
            html += '<th width="200px" style="text-align:center;font-size:25px">' + heads[i] + '<span style="font-size:15px">(桶/箱)</span></th>'
        else
            html += '<th style="text-align:center;font-size:25px">' + heads[i] + '</th>';
    }
    html += '</tr>';
    return html;
}

function setData(data, button) {
    var html = '';
    for(var i = 0; i < data.length; i++) {
        if(i+1 == data.length && data[i].location) {
            superObj.lastItem = data[i];
        }
        html += '<tr style="text-align:center">';
        for(var j in data[i]) {
            if(j == 'remark')
                continue;
            if(j == 'id') {
                html += '<td>' + (i+1) + '</td>';
                continue;
            }

            html += '<td>' + data[i][j] + '</td>';
        }
        if(button)
            html += '<td><button class="btn btn-info btn-sm" id="newChangeButton" data-toggle="modal" data-target="#newChange" onclick="preChange('+ data[i].id +')">增减</button><button class="btn btn-info btn-sm" id="modProductButton" data-toggle="modal" data-target="#modProduct" onclick="preMod('+ data[i].id +')">修改</button></td><td>' + data[i]['remark'] + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button class="btn btn-info btn-sm" id="newDeleteButton" onclick="preDelete('+ data[i].id +')">删除</button></td>';
        else
            html += '<td>' + data[i]['remark'] + '</td><td><button class="btn btn-info btn-sm" onclick="preDel('+data[i].id+')">删除</button></td>'
        // html += '<td>' + data[i]['remark'] + '</td>';
        html += '</tr>';
    }
    return html;
}

function newProduct() {
    if(superObj.loading)
        return;
    superObj.loading = true;
    $.ajax({
        url: 'api/inventories',
        method: 'post',
        data: {
            name: $('#newProductName').val(),
            model: $('#newProductModel').val(),
            amount: $("#newProductAmount").val(),
            location: $('#newProductLocation').val(),
            remark: $('#newProductRemark').val(),
        },
        success: function(res) {
            $('#newProduct').modal('hide');
            loadProduct();
            superObj.loading = false;
        }
    })
}

function preMod(id) {
    superObj.modId = id;
    for(var i in superObj.inven) {
        if(superObj.inven[i].id == id) {
            fillInvenForm(superObj.inven[i]);
            return;
        }
    }
}

function fillInvenForm(product) {
    $('#modProductName').val(product.name);
    $('#modProductModel').val(product.model);
    $('#modProductAmount').val(product.amount);
    $('#modProductLocation').val(product.location);
    $('#modProductRemark').val(product.remark);
}

function modProduct() {
    if(superObj.loading)
        return;
    superObj.loading = true;
    $.ajax({
        url: 'api/inventories/'+superObj.modId,
        method: 'put',
        data: {
            name: $('#modProductName').val(),
            model: $('#modProductModel').val(),
            amount: $('#modProductAmount').val(),
            location: $('#modProductLocation').val(),
            remark: $('#modProductRemark').val(),
        },
        success: function(res) {
            console.log(res);
            loadProduct();
            $('#modProduct').modal('hide');
            superObj.loading = false;
        }
    })
}

function preChange(id) {
    console.log('pre cg '+id);
    $('#newChangeProductId').val(id);
    $('#newChangeDate').val(getDate());
}

function loadProduct() {

    $.ajax({
        url: "api/inventories",
        success: function(res) {
            superObj.inven = JSON.parse(res);
            $('#invenBody').html(setData(superObj.inven, true));
        }
    });

    $.ajax({
        url: 'api/changes',
        success: function(res) {
            console.log(res);
            superObj.changes = JSON.parse(res);
            $('#changeBody').html(setData(superObj.changes));
        }
    });
}

function newChange() {
    if(superObj.loading)
        return;
    superObj.loading = true;
    $.ajax({
        url: 'api/changes',
        method: 'post',
        data: {
            productId: $('#newChangeProductId').val(),
            type: $("input[name='kind']:checked").val(),
            amount: $("input[name='kind']:checked").val() == '入库' ? $('#newChangeAmount').val() : -1 * $('#newChangeAmount').val(),
            remark: $('#newChangeRemark').val(),
            date: $('#newChangeDate').val()
        },
        success: function(res) {
            $('#newChange').modal('hide');
            superObj.loading = false;
            loadProduct();
        }
    })
}

//delete change
function preDel(id) {
    var result = (confirm('确定要删除序号为'+id+'的记录吗'));
    if(result == true)
    {
        $.ajax({
            url: 'api/changes/'+id,
            method: 'delete',
            success: function(res) {
                console.log(res);
                loadProduct();
            }
        })
    }
}

//delete inventory
function preDelete(id) {
    var result = (confirm('确定要删除序号为'+id+'的库存吗'));
    if(result == true)
    {
        $.ajax({
            url: 'api/inventories/'+id,
            method: 'delete',
            success: function(res) {
                console.log(res);
                loadProduct();
            }
        })
    }
}


function getDate() {
    var d = new Date();
    return lpad(d.getMonth()+1) + '-' + lpad(d.getDate()) + ' ' + lpad(d.getHours()) + ':' + lpad(d.getMinutes());
}

function lpad(num) {
    var r = num;
    if(r < 10)
        r = '0' + r;
    return '' + r;
}

function delLast() {
    var ans = confirm('确认删除 ' + superObj.lastItem.name + ' ?');
    if(ans == true) {
        $.ajax({
            url: 'api/inventories/'+superObj.lastItem.id,
            method: 'delete',
            success: function(res) {
                loadProduct();
                alert(res == 'ok' ? '删除成功' : '删除失败');
            }
        });
    }
}

$.ajaxSetup({cache:false});
$('#invenHead').html(setHead(cfg.invenHead));
$('#changeHead').html(setHead(cfg.changeHead));
loadProduct();

setInterval(function(){
    loadProduct();
}, 5000);