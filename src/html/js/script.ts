const apiUrl = 'http://localhost:3000/api/';
export interface Item {
    id?: number;
    name: string;
    numeric: number;
    city: string;
    country: string;
}
// ------------------------------------------------------------------------------------------------------------------------------------------------
const xhrRequest = function (url: string, method?: string, body?: any) {
    const request = new XMLHttpRequest();
    return new Promise(function (resolve, reject) {
        request.onreadystatechange = function () {
            if (request.readyState !== 4) return;
            if (request.status >= 200 && request.status < 300) {
                resolve(request);
            } else {
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
export class Table {
    items: Item[] = [];
    targetElement: Element;
    popup: Popup;
    sortOrder = { key: 'id', accending: true };
    constructor(targetElement: Element, popup: Popup) {
        this.targetElement = targetElement;
        this.popup = popup;
    }
    // ----------------------------------------- HTTP REQUESTS ---------------------------------------------------------------------------------
    xhrDeleteById(id: number) {
        return xhrRequest(`${apiUrl}items/${id}`, 'DELETE')
            .then(() => this.refresh());
    }
    xhrAddItem(item: Item) {
        return xhrRequest(`${apiUrl}items`, 'POST', item)
            .then(() => this.refresh());
    }
    xhrEditItem(item: Item) {
        return xhrRequest(`${apiUrl}items/${item.id}`, 'PUT', item)
            .then(() => this.refresh());
    }
    xhrGetAll() {
        return xhrRequest(apiUrl + 'items')
            .then((data: any) => {
                this.items = JSON.parse(data.response);
            })
            .catch((error) => {
                console.log('Something went wrong', error);
            });
    }
    refresh() {
        return this.xhrGetAll().then(() => {
            this.orderByCurrentSortOrder();
            this.draw();
        });
    }
    // ----------------------------------------- SORTING ---------------------------------------------------------------------------------
    orderByCurrentSortOrder() {
        this.orderBy(this.sortOrder.key, this.sortOrder.accending);
    }

    orderBy(key: string, accending: boolean) {
        this.sortOrder = { key, accending };
        let direction: number = accending ? 1 : -1;
        if (this.items.length) {
            const cellValue = this.items[0][key];
            const cellType = typeof cellValue;
            let compareFn: (a: any, b: any) => number | undefined;
            if (cellType === 'number') {
                compareFn = (a, b) => (a[key] - b[key]) * direction;
            } else if (cellType === 'string') {
                compareFn = (a, b) => {
                    if (a[key] < b[key]) {
                        return direction * -1;
                    } else if (a[key] > b[key]) {
                        return direction * 1;
                    } else {
                        return 0;
                    }
                };
            } else {
                compareFn = undefined;
            }
            this.items = this.items.sort(compareFn);
        }
    }
    // ----------------------------------------- HTML GENERATION ---------------------------------------------------------------------------------
    headerRow() {
        let cell: Element;
        let row: Element;
        let addCell = (text: string) => {
            let cell: Element;
            cell = document.createElement('div');
            cell.innerHTML = text;
            cell.className = 'table-header-cell';
            row.insertAdjacentElement('beforeend', cell);
            return cell;
        }
        row = document.createElement('div');
        row.className = 'table-header-row';
        addCell('Id').addEventListener('click', () => { this.orderBy('id', true); this.draw(); });
        addCell('Name').addEventListener('click', () => { this.orderBy('name', true); this.draw(); });
        addCell('Numeric').addEventListener('click', () => { this.orderBy('numeric', true); this.draw(); });
        addCell('City').addEventListener('click', () => { this.orderBy('city', true); this.draw(); });
        addCell('Country').addEventListener('click', () => { this.orderBy('country', true); this.draw(); });
        addCell(' ');
        return row;
    }

    dataRow(item: Item) {
        let row: Element;
        let addTextCell = (text: any) => {
            let cell: Element;
            cell = document.createElement('div');
            cell.innerHTML = text;
            row.insertAdjacentElement('beforeend', cell);
        }
        row = document.createElement('div');
        row.className = 'table-row';
        addTextCell(item.id);
        addTextCell(item.name);
        addTextCell(item.numeric);
        addTextCell(item.city);
        addTextCell(item.country);
        const cell = document.createElement('button');
        cell.innerHTML = '&times;';
        cell.className = 'btn btn-delete';
        cell.type = 'button';
        cell.addEventListener('click', (event) => {
            window.history.pushState({}, 'Delete #' + item.id, '/?delete=' + item.id);
            this.displayDeleteDialog(item.id);
            event.stopPropagation();
        });
        row.insertAdjacentElement('beforeend', cell);
        row.addEventListener('click', (event) => {
            window.history.pushState({}, 'Edit #' + item.id, '/?edit=' + item.id);
            this.displayEditDialog(item.id);
        });
        return row;
    }


    draw() {
        // TODO redraw performance can be improved
        const rowElements = this.targetElement.querySelectorAll(':scope>div');
        let rowsVisible = rowElements.length;
        if (rowsVisible) {
            rowElements[0].replaceWith(this.headerRow());
        } else {
            this.targetElement.insertAdjacentElement('beforeend', this.headerRow());
        }
        this.items.forEach((item, i) => {
            if (i < rowsVisible - 1) {
                rowElements[i + 1].replaceWith(this.dataRow(item));
            } else {
                this.targetElement.insertAdjacentElement('beforeend', this.dataRow(item));
            }
        });

        if (rowsVisible > this.items.length + 1) {
            for (let i = this.items.length + 1; i < rowsVisible; i++) {
                this.targetElement.removeChild(rowElements[i]);
            }
        }
    }

    displayDeleteDialog(id: number) {
        const container = document.createElement('div');
        const text = document.createElement('div');
        text.innerHTML = 'Are you sure you want to delete item #' + id + '?';
        text.style.textAlign = 'center';
        text.style.padding = '15px';
        const buttons = document.createElement('div');
        buttons.style.textAlign = 'right';
        const buttonYes = document.createElement('button');
        buttonYes.className = 'btn';
        buttonYes.type = 'button';
        buttonYes.innerHTML = 'Yes';
        const buttonNo = document.createElement('button');
        buttonNo.className = 'btn';
        buttonNo.type = 'button';
        buttonNo.innerHTML = 'No';
        buttonNo.style.marginLeft = '15px';
        buttonNo.style.marginTop = '5px';
        buttons.insertAdjacentElement('beforeend', buttonYes);
        buttons.insertAdjacentElement('beforeend', buttonNo);
        container.insertAdjacentElement('beforeend', text);
        container.insertAdjacentElement('beforeend', buttons);

        buttonNo.addEventListener('click', (event) => {
            event.preventDefault();
            this.popup.hide();
        });
        buttonYes.addEventListener('click', (event) => {
            event.preventDefault();
            this.popup.hide();
            this.xhrDeleteById(id);
        });
        this.popup.displayElement(container);
    }

    displayAddDialog() {
        let item: Item;
        const container = document.createElement('div');
        container.innerHTML = `
            <div class="dialog-inputs">
                <div id="dialog-title">Add item</div>
                <div class="dialog-field">Name: <input id="dia-name"  /></div>
                <div class="dialog-field">Numeric: <input id="dia-numeric" type="number"   /></div>
                <div class="dialog-field">City: <input id="dia-city"  /></div>
                <div class="dialog-field">Country: <input id="dia-country" /></div>
                <div class="dialog-buttons">
                    <button class="btn" type="button" id="dialog-add">Add</button>
                    <button class="btn" type="button" id="dialog-cancel">Cancel</button>
                </div>
            </div>`;
        container.querySelector(':scope #dialog-cancel').addEventListener('click', (event) => {
            event.preventDefault();
            this.popup.hide();
        });
        container.querySelector(':scope #dialog-add').addEventListener('click', (event) => {
            event.preventDefault();
            item = {
                name: container.querySelector(':scope #dia-name')['value'],
                numeric: Number(container.querySelector(':scope #dia-numeric')['value']),
                city: container.querySelector(':scope #dia-city')['value'],
                country: container.querySelector(':scope #dia-country')['value']
            };
            this.popup.hide();
            this.xhrAddItem(item).then(() => {
            });
        });
        this.popup.displayElement(container);
    }

    displayEditDialog(id: number) {
        let item = this.items.find(i => i.id === id);
        if (item) {
            const container = document.createElement('div');
            container.innerHTML = `
            <div class="dialog-inputs">
                <div id="dialog-title">Edit item</div>
                <div class="dialog-field">Id: <input id="dia-id" disabled value="${item.id}"/></div>
                <div class="dialog-field">Name: <input id="dia-name" value="${item.name}" /></div>
                <div class="dialog-field">Numeric: <input id="dia-numeric" type="number"  value="${item.numeric}" /></div>
                <div class="dialog-field">City: <input id="dia-city" value="${item.city}" /></div>
                <div class="dialog-field">Country: <input id="dia-country" value="${item.country}" /></div>
                <div class="dialog-buttons">
                    <button class="btn" type="button" id="dialog-save">Save</button>
                    <button class="btn" type="button" id="dialog-cancel">Cancel</button>
                </div>
            </div>`;
            container.querySelector(':scope #dialog-cancel').addEventListener('click', (event) => {
                event.preventDefault();
                this.popup.hide();
            });
            container.querySelector(':scope #dialog-save').addEventListener('click', (event) => {
                event.preventDefault();
                item = {
                    id: item.id,
                    name: container.querySelector(':scope #dia-name')['value'],
                    numeric: Number(container.querySelector(':scope #dia-numeric')['value']),
                    city: container.querySelector(':scope #dia-city')['value'],
                    country: container.querySelector(':scope #dia-country')['value']
                };
                this.popup.hide();
                this.xhrEditItem(item).then(() => {
                });
            });
            this.popup.displayElement(container);
        }
    }
}
// ----------------------------------- ROUTE PARSER ----------------------------------------------------------------------------------------------
type RouteParameters = { action: string, id: number };
const getRouteParameters = function (parameterString: string): RouteParameters {
    const pair = parameterString.substring(1).split('=');
    return { action: pair[0], id: Number(pair[1]) };
}
// ---------------------------------- DIALOG -----------------------------------------------------------------------------------------------------
export class Popup {
    dialog: HTMLDivElement = document.querySelector('.dialog-backdrop');
    dialogContent: HTMLDivElement = this.dialog.querySelector(':scope>.dialog-content');
    dialogCloseButton: HTMLButtonElement = this.dialog.querySelector(':scope .btn-dialog-close');
    dialogInner: HTMLDivElement = this.dialog.querySelector(':scope .relative');
    dialogCustomElement: HTMLDivElement;

    constructor() {
        this.dialogContent.style.top = 100 + '%';
        this.dialogCloseButton.addEventListener('click', (event) => {
            event.preventDefault();
            this.hide();
        });
        this.dialogContent.addEventListener('click', (event) => {
            event.stopPropagation();
        });
        this.dialog.addEventListener('click', (event) => {
            event.preventDefault();
            this.hide();
        });
        document.addEventListener('keyup', (event) => {
            if (event.keyCode == 27) {
                this.hide();
            }
        });
    }
    show() {
        this.dialog.classList.add("dialog-opened");
        this.dialogContent.style.top = 30 + '%';
    }
    hide() {
        this.dialogContent.style.top = 100 + '%';
        window.history.pushState({}, '', '/');
        this.dialog.classList.remove("dialog-opened");
        if (this.dialogCustomElement) {
            this.dialogInner.removeChild(this.dialogCustomElement);
        }
    }
    displayElement(element: HTMLDivElement) {
        this.dialogCustomElement = element;
        this.dialogInner.insertAdjacentElement('beforeend', this.dialogCustomElement);
        this.show();
    }
}

if (window && window['scriptExecuteEnabled']) {
    const tableTarget = document.querySelector('#table');
    const popup = new Popup();
    const table = new Table(tableTarget, popup);
    document.querySelector('#add-item').addEventListener('click', (event) => {
        window.history.pushState({}, 'Add item', '/?add');
        table.displayAddDialog();
    });
    document.addEventListener('DOMContentLoaded', (event) => {
        table.refresh().then(() => {
            const routeParameters = getRouteParameters(window.location.search);
            if (routeParameters.action) {
                if (routeParameters.action === 'add') {
                    table.displayAddDialog();
                } else if (routeParameters.action === 'edit' && routeParameters.id) {
                    table.displayEditDialog(routeParameters.id);
                } else if (routeParameters.action === 'delete' && routeParameters.id) {
                    table.displayDeleteDialog(routeParameters.id);
                }
            }
        });
    });
}