var superObj = {};

function setHead(heads) {
    var html = '<tr>';
    for(var i = 0; i < heads.length; i++) {
        html += '<th>' + heads[i] + '</th>';
    }
    html += '</tr>';
    return html;
}

function setData(data, button) {
    var html = '';
    for(var i = 0; i < data.length; i++) {
        html += '<tr>';
        for(var j in data[i]) {
            html += '<td>' + data[i][j] + '</td>';
        }
        if(button)
            html += '<td><button class="btn btn-info btn-sm" id="modProductButton" data-toggle="modal" data-target="#modProduct" onclick="preMod('+ data[i].id +')">修改</button><button class="btn btn-info btn-sm" id="newChangeButton" data-toggle="modal" data-target="#newChange" onclick="preChange('+ data[i].id +')">变动</button></td></tr>';
        else
            html += '</tr>';
    }
    return html;
}

function newProduct() {
    $.ajax({
        url: 'api/inventories',
        method: 'post',
        data: {
            name: $('#newProductName').val(),
            model: $('#newProductModel').val(),
            spec: $("#newProductSpec").val(),
            amount: $("#newProductAmount").val(),
            location: $('#newProductLocation').val(),
            remark: $('#newProductRemark').val(),
        },
        success: function(res) {
            $('#newProductButton').click();
            loadProduct();
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
    $('#modProductSpec').val(product.spec);
    $('#modProductAmount').val(product.amount);
    $('#modProductLocation').val(product.location);
    $('#modProductRemark').val(product.remark);
}

function modProduct() {
    console.log('mod');
    $.ajax({
        url: 'api/inventories/'+superObj.modId,
        method: 'put',
        data: {
            name: $('#modProductName').val(),
            model: $('#modProductModel').val(),
            spec: $('#modProductModel').val(),
            amount: $('#modProductAmount').val(),
            location: $('#modProductLocation').val(),
            remark: $('#modProductRemark').val(),
        },
        success: function(res) {
            console.log(res);
            loadProduct();
            $('#modProductButton').click();
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
    $.ajax({
        url: 'api/changes',
        method: 'post',
        data: {
            productId: $('#newChangeProductId').val(),
            type: $('#newChangeType').val(),
            amount: $('#newChangeType').val() == '入库' ? $('#newChangeAmount').val() : -1 * $('#newChangeAmount').val(),
            remark: $('#newChangeRemark').val(),
            date: $('#newChangeDate').val()
        },
        success: function(res) {
            console.log(res);
            loadProduct();
            $('#newChangeButton').click();
        }
    })
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


$('#invenHead').html(setHead(cfg.invenHead));
$('#changeHead').html(setHead(cfg.changeHead));
loadProduct();