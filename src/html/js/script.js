"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var apiUrl = 'http://localhost:3000/api/';
// ------------------------------------------------------------------------------------------------------------------------------------------------
var xhrRequest = function (url, method, body) {
    var request = new XMLHttpRequest();
    return new Promise(function (resolve, reject) {
        request.onreadystatechange = function () {
            if (request.readyState !== 4)
                return;
            if (request.status >= 200 && request.status < 300) {
                resolve(request);
            }
            else {
                reject({
                    status: request.status,
                    statusText: request.statusText
                });
            }
        };
        request.open(method || 'GET', url, true);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.send(JSON.stringify(body));
    });
};
// ------------------------------------------------------------------------------------------------------------------------------------------------
var Table = /** @class */ (function () {
    function Table(targetElement, popup) {
        this.items = [];
        this.sortOrder = { key: 'id', accending: true };
        this.targetElement = targetElement;
        this.popup = popup;
    }
    // ----------------------------------------- HTTP REQUESTS ---------------------------------------------------------------------------------
    Table.prototype.xhrDeleteById = function (id) {
        var _this = this;
        return xhrRequest(apiUrl + "items/" + id, 'DELETE')
            .then(function () { return _this.refresh(); });
    };
    Table.prototype.xhrAddItem = function (item) {
        var _this = this;
        return xhrRequest(apiUrl + "items", 'POST', item)
            .then(function () { return _this.refresh(); });
    };
    Table.prototype.xhrEditItem = function (item) {
        var _this = this;
        return xhrRequest(apiUrl + "items/" + item.id, 'PUT', item)
            .then(function () { return _this.refresh(); });
    };
    Table.prototype.xhrGetAll = function () {
        var _this = this;
        return xhrRequest(apiUrl + 'items')
            .then(function (data) {
            _this.items = JSON.parse(data.response);
        })
            .catch(function (error) {
            console.log('Something went wrong', error);
        });
    };
    Table.prototype.refresh = function () {
        var _this = this;
        return this.xhrGetAll().then(function () {
            _this.orderByCurrentSortOrder();
            _this.draw();
        });
    };
    // ----------------------------------------- SORTING ---------------------------------------------------------------------------------
    Table.prototype.orderByCurrentSortOrder = function () {
        this.orderBy(this.sortOrder.key, this.sortOrder.accending);
    };
    Table.prototype.orderBy = function (key, accending) {
        this.sortOrder = { key: key, accending: accending };
        var direction = accending ? 1 : -1;
        if (this.items.length) {
            var cellValue = this.items[0][key];
            var cellType = typeof cellValue;
            var compareFn = void 0;
            if (cellType === 'number') {
                compareFn = function (a, b) { return (a[key] - b[key]) * direction; };
            }
            else if (cellType === 'string') {
                compareFn = function (a, b) {
                    if (a[key] < b[key]) {
                        return direction * -1;
                    }
                    else if (a[key] > b[key]) {
                        return direction * 1;
                    }
                    else {
                        return 0;
                    }
                };
            }
            else {
                compareFn = undefined;
            }
            this.items = this.items.sort(compareFn);
        }
    };
    // ----------------------------------------- HTML GENERATION ---------------------------------------------------------------------------------
    Table.prototype.headerRow = function () {
        var _this = this;
        var cell;
        var row;
        var addCell = function (text) {
            var cell;
            cell = document.createElement('div');
            cell.innerHTML = text;
            cell.className = 'table-header-cell';
            row.insertAdjacentElement('beforeend', cell);
            return cell;
        };
        row = document.createElement('div');
        row.className = 'table-header-row';
        addCell('Id').addEventListener('click', function () { _this.orderBy('id', true); _this.draw(); });
        addCell('Name').addEventListener('click', function () { _this.orderBy('name', true); _this.draw(); });
        addCell('Numeric').addEventListener('click', function () { _this.orderBy('numeric', true); _this.draw(); });
        addCell('City').addEventListener('click', function () { _this.orderBy('city', true); _this.draw(); });
        addCell('Country').addEventListener('click', function () { _this.orderBy('country', true); _this.draw(); });
        addCell(' ');
        return row;
    };
    Table.prototype.dataRow = function (item) {
        var _this = this;
        var row;
        var addTextCell = function (text) {
            var cell;
            cell = document.createElement('div');
            cell.innerHTML = text;
            row.insertAdjacentElement('beforeend', cell);
        };
        row = document.createElement('div');
        row.className = 'table-row';
        addTextCell(item.id);
        addTextCell(item.name);
        addTextCell(item.numeric);
        addTextCell(item.city);
        addTextCell(item.country);
        var cell = document.createElement('button');
        cell.innerHTML = '&times;';
        cell.className = 'btn btn-delete';
        cell.type = 'button';
        cell.addEventListener('click', function (event) {
            window.history.pushState({}, 'Delete #' + item.id, '/?delete=' + item.id);
            _this.displayDeleteDialog(item.id);
            event.stopPropagation();
        });
        row.insertAdjacentElement('beforeend', cell);
        row.addEventListener('click', function (event) {
            window.history.pushState({}, 'Edit #' + item.id, '/?edit=' + item.id);
            _this.displayEditDialog(item.id);
        });
        return row;
    };
    Table.prototype.draw = function () {
        var _this = this;
        // TODO redraw performance can be improved
        var rowElements = this.targetElement.querySelectorAll(':scope>div');
        var rowsVisible = rowElements.length;
        if (rowsVisible) {
            rowElements[0].replaceWith(this.headerRow());
        }
        else {
            this.targetElement.insertAdjacentElement('beforeend', this.headerRow());
        }
        this.items.forEach(function (item, i) {
            if (i < rowsVisible - 1) {
                rowElements[i + 1].replaceWith(_this.dataRow(item));
            }
            else {
                _this.targetElement.insertAdjacentElement('beforeend', _this.dataRow(item));
            }
        });
        if (rowsVisible > this.items.length + 1) {
            for (var i = this.items.length + 1; i < rowsVisible; i++) {
                this.targetElement.removeChild(rowElements[i]);
            }
        }
    };
    Table.prototype.displayDeleteDialog = function (id) {
        var _this = this;
        var container = document.createElement('div');
        var text = document.createElement('div');
        text.innerHTML = 'Are you sure you want to delete item #' + id + '?';
        text.style.textAlign = 'center';
        text.style.padding = '15px';
        var buttons = document.createElement('div');
        buttons.style.textAlign = 'right';
        var buttonYes = document.createElement('button');
        buttonYes.className = 'btn';
        buttonYes.type = 'button';
        buttonYes.innerHTML = 'Yes';
        var buttonNo = document.createElement('button');
        buttonNo.className = 'btn';
        buttonNo.type = 'button';
        buttonNo.innerHTML = 'No';
        buttonNo.style.marginLeft = '15px';
        buttonNo.style.marginTop = '5px';
        buttons.insertAdjacentElement('beforeend', buttonYes);
        buttons.insertAdjacentElement('beforeend', buttonNo);
        container.insertAdjacentElement('beforeend', text);
        container.insertAdjacentElement('beforeend', buttons);
        buttonNo.addEventListener('click', function (event) {
            event.preventDefault();
            _this.popup.hide();
        });
        buttonYes.addEventListener('click', function (event) {
            event.preventDefault();
            _this.popup.hide();
            _this.xhrDeleteById(id);
        });
        this.popup.displayElement(container);
    };
    Table.prototype.displayAddDialog = function () {
        var _this = this;
        var item;
        var container = document.createElement('div');
        container.innerHTML = "\n            <div class=\"dialog-inputs\">\n                <div id=\"dialog-title\">Add item</div>\n                <div class=\"dialog-field\">Name: <input id=\"dia-name\"  /></div>\n                <div class=\"dialog-field\">Numeric: <input id=\"dia-numeric\" type=\"number\"   /></div>\n                <div class=\"dialog-field\">City: <input id=\"dia-city\"  /></div>\n                <div class=\"dialog-field\">Country: <input id=\"dia-country\" /></div>\n                <div class=\"dialog-buttons\">\n                    <button class=\"btn\" type=\"button\" id=\"dialog-add\">Add</button>\n                    <button class=\"btn\" type=\"button\" id=\"dialog-cancel\">Cancel</button>\n                </div>\n            </div>";
        container.querySelector(':scope #dialog-cancel').addEventListener('click', function (event) {
            event.preventDefault();
            _this.popup.hide();
        });
        container.querySelector(':scope #dialog-add').addEventListener('click', function (event) {
            event.preventDefault();
            item = {
                name: container.querySelector(':scope #dia-name')['value'],
                numeric: Number(container.querySelector(':scope #dia-numeric')['value']),
                city: container.querySelector(':scope #dia-city')['value'],
                country: container.querySelector(':scope #dia-country')['value']
            };
            _this.popup.hide();
            _this.xhrAddItem(item).then(function () {
            });
        });
        this.popup.displayElement(container);
    };
    Table.prototype.displayEditDialog = function (id) {
        var _this = this;
        var item = this.items.find(function (i) { return i.id === id; });
        if (item) {
            var container_1 = document.createElement('div');
            container_1.innerHTML = "\n            <div class=\"dialog-inputs\">\n                <div id=\"dialog-title\">Edit item</div>\n                <div class=\"dialog-field\">Id: <input id=\"dia-id\" disabled value=\"" + item.id + "\"/></div>\n                <div class=\"dialog-field\">Name: <input id=\"dia-name\" value=\"" + item.name + "\" /></div>\n                <div class=\"dialog-field\">Numeric: <input id=\"dia-numeric\" type=\"number\"  value=\"" + item.numeric + "\" /></div>\n                <div class=\"dialog-field\">City: <input id=\"dia-city\" value=\"" + item.city + "\" /></div>\n                <div class=\"dialog-field\">Country: <input id=\"dia-country\" value=\"" + item.country + "\" /></div>\n                <div class=\"dialog-buttons\">\n                    <button class=\"btn\" type=\"button\" id=\"dialog-save\">Save</button>\n                    <button class=\"btn\" type=\"button\" id=\"dialog-cancel\">Cancel</button>\n                </div>\n            </div>";
            container_1.querySelector(':scope #dialog-cancel').addEventListener('click', function (event) {
                event.preventDefault();
                _this.popup.hide();
            });
            container_1.querySelector(':scope #dialog-save').addEventListener('click', function (event) {
                event.preventDefault();
                item = {
                    id: item.id,
                    name: container_1.querySelector(':scope #dia-name')['value'],
                    numeric: Number(container_1.querySelector(':scope #dia-numeric')['value']),
                    city: container_1.querySelector(':scope #dia-city')['value'],
                    country: container_1.querySelector(':scope #dia-country')['value']
                };
                _this.popup.hide();
                _this.xhrEditItem(item).then(function () {
                });
            });
            this.popup.displayElement(container_1);
        }
    };
    return Table;
}());
exports.Table = Table;
var getRouteParameters = function (parameterString) {
    var pair = parameterString.substring(1).split('=');
    return { action: pair[0], id: Number(pair[1]) };
};
// ---------------------------------- DIALOG -----------------------------------------------------------------------------------------------------
var Popup = /** @class */ (function () {
    function Popup() {
        var _this = this;
        this.dialog = document.querySelector('.dialog-backdrop');
        this.dialogContent = this.dialog.querySelector(':scope>.dialog-content');
        this.dialogCloseButton = this.dialog.querySelector(':scope .btn-dialog-close');
        this.dialogInner = this.dialog.querySelector(':scope .relative');
        this.dialogContent.style.top = 100 + '%';
        this.dialogCloseButton.addEventListener('click', function (event) {
            event.preventDefault();
            _this.hide();
        });
        this.dialogContent.addEventListener('click', function (event) {
            event.stopPropagation();
        });
        this.dialog.addEventListener('click', function (event) {
            event.preventDefault();
            _this.hide();
        });
        document.addEventListener('keyup', function (event) {
            if (event.keyCode == 27) {
                _this.hide();
            }
        });
    }
    Popup.prototype.show = function () {
        this.dialog.classList.add("dialog-opened");
        this.dialogContent.style.top = 30 + '%';
    };
    Popup.prototype.hide = function () {
        this.dialogContent.style.top = 100 + '%';
        window.history.pushState({}, '', '/');
        this.dialog.classList.remove("dialog-opened");
        if (this.dialogCustomElement) {
            this.dialogInner.removeChild(this.dialogCustomElement);
        }
    };
    Popup.prototype.displayElement = function (element) {
        this.dialogCustomElement = element;
        this.dialogInner.insertAdjacentElement('beforeend', this.dialogCustomElement);
        this.show();
    };
    return Popup;
}());
exports.Popup = Popup;
if (window && window['scriptExecuteEnabled']) {
    var tableTarget = document.querySelector('#table');
    var popup = new Popup();
    var table_1 = new Table(tableTarget, popup);
    document.querySelector('#add-item').addEventListener('click', function (event) {
        window.history.pushState({}, 'Add item', '/?add');
        table_1.displayAddDialog();
    });
    document.addEventListener('DOMContentLoaded', function (event) {
        table_1.refresh().then(function () {
            var routeParameters = getRouteParameters(window.location.search);
            if (routeParameters.action) {
                if (routeParameters.action === 'add') {
                    table_1.displayAddDialog();
                }
                else if (routeParameters.action === 'edit' && routeParameters.id) {
                    table_1.displayEditDialog(routeParameters.id);
                }
                else if (routeParameters.action === 'delete' && routeParameters.id) {
                    table_1.displayDeleteDialog(routeParameters.id);
                }
            }
        });
    });
}
