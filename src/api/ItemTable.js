"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
function pickRandomly(arr) {
    if (Array.isArray(arr) && arr.length) {
        var choice = Math.floor(Math.random() * arr.length - 0.0000001);
        return arr[choice];
    }
    else {
        return null;
    }
}
function randomName() {
    var names = ['John', 'Doe', 'Patrick', 'Linda', 'Bill', 'Peter', 'Ivan', 'Jackson', 'Barbara', 'Ieva', 'Norton', 'Donald'];
    return pickRandomly(names) + ' ' + pickRandomly(names);
}
function randomItem() {
    var item = {
        name: randomName(),
        numeric: Math.floor(Math.random() * 99999),
        city: pickRandomly(['Riga', 'New-York', 'Reno', 'Paris', 'Ventspils', 'Moscow']),
        country: pickRandomly(['USA', 'France', 'Italy', 'Latvia'])
    };
    return item;
}
var ItemTable = /** @class */ (function () {
    function ItemTable() {
        this.nextId = 1;
        this.items = [];
        this.generateRandomItems(200);
    }
    ItemTable.prototype.generateRandomItems = function (count) {
        for (var i = 0; i < count; i++, this.nextId++) {
            var item = __assign({ id: this.nextId }, randomItem());
            this.items.push(item);
        }
    };
    ItemTable.prototype.getAll = function () {
        return this.items;
    };
    ItemTable.prototype.getById = function (id) {
        return this.items.find(function (i) { return i.id === id; });
    };
    ItemTable.prototype.deleteById = function (id) {
        return this.items = this.items.filter(function (i) { return i.id !== id; });
    };
    ItemTable.prototype.putItem = function (item) {
        if (item.id) {
            this.items = this.items.filter(function (i) { return i.id !== item.id; });
        }
        else {
            item.id = this.nextId++;
        }
        this.items.push(item);
    };
    return ItemTable;
}());
exports.ItemTable = ItemTable;
