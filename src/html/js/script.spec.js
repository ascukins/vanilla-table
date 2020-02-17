describe("Unit tests for table DOM manipulation", () => {
  let tableTarget, popup, table;
  let dummyItem = {
    numeric: 99999999,
    name: "kuku",
    city: "au",
    country: "pOpa"
  };
  beforeEach(function() {
    tableTarget = document.createElement("div");
    popup = {
      hide: () => {},
      displayElement: () => {}
    };
    table = new exports.Table(tableTarget, popup);
  });

  it("should generate headerRow", () => {
    let row = table.headerRow();
    let html = row.outerHTML;
    expect(html).toBe(
      '<div class="table-header-row"><div class="table-header-cell">Id</div><div class="table-header-cell">Name</div><div class="table-header-cell">Numeric</div><div class="table-header-cell">City</div><div class="table-header-cell">Country</div><div class="table-header-cell"> </div></div>'
    );
  });

  it("should generate dataRow", () => {
    let row = table.dataRow(dummyItem);
    let html = row.outerHTML;
    expect(html).toBe(
      '<div class="table-row"><div>undefined</div><div>kuku</div><div>99999999</div><div>au</div><div>pOpa</div><button class="btn btn-delete" type="button">×</button></div>'
    );
  });
});

describe("Integration tests for table Back-end requests", () => {
  let tableTarget, popup, table;
  beforeEach(function() {
    tableTarget = document.createElement("div");
    popup = {
      hide: () => {},
      displayElement: () => {}
    };
    table = new exports.Table(tableTarget, popup);
  });

  it("should GET items", done => {
    table.xhrGetAll().then(() => {
      expect(table.items.length).toBeGreaterThan(1);
      done();
    });
  });

  it("should DELETE items", done => {
    let initialLength;
    let id;
    table.xhrGetAll().then(() => {
      initialLength = table.items.length;
      id = table.items[1].id;
      table.xhrDeleteById(id).then(() => {
        expect(table.items.length).toBe(initialLength - 1);
        expect(table.items.find(i => i.id === id)).toBe(undefined);
        done();
      });
    });
  });
});
