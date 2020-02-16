export interface Item {
    id?: number;
    name: string;
    numeric: number;
    city: string;
    country: string;
}

function pickRandomly(arr: any[]) {
    if (Array.isArray(arr) && arr.length) {
        const choice = Math.floor(Math.random() * arr.length - 0.0000001);
        return arr[choice];
    } else {
        return null;
    }
}
function randomName() {
    const names = ['John', 'Doe', 'Patrick', 'Linda', 'Bill', 'Peter', 'Ivan', 'Jackson', 'Barbara', 'Ieva', 'Norton', 'Donald'];
    return pickRandomly(names) + ' ' + pickRandomly(names);
}

function randomItem(): Item {
    const item: Item = {
        name: randomName(),
        numeric: Math.floor(Math.random() * 99999),
        city: pickRandomly(['Riga', 'New-York', 'Reno', 'Paris', 'Ventspils', 'Moscow']),
        country: pickRandomly(['USA', 'France', 'Italy', 'Latvia'])
    };
    return item;
}

export class ItemTable {
    nextId = 1;
    items: Item[] = [];

    constructor() {
        this.generateRandomItems(200);
    }

    generateRandomItems(count: number) {
        for (let i = 0; i < count; i++ , this.nextId++) {
            const item = { id: this.nextId, ...randomItem() };
            this.items.push(item);
        }
    }

    getAll(): Item[] {
        return this.items;
    }

    getById(id: number) {
        return this.items.find((i) => i.id === id);
    }

    deleteById(id: number) {
        return this.items = this.items.filter((i) => i.id !== id);
    }

    putItem(item: Item) {
        if (item.id) {
            this.items = this.items.filter((i) => i.id !== item.id);
        } else {
            item.id = this.nextId++;
        }
        this.items.push(item);
    }

}