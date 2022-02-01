// js object to sql insert statement
export function jsObjectToSqlInsert(tableName: string, jsObject: any): string {
  const keys = Object.keys(jsObject);
  const values = keys.map((key) => `'${jsObject[key]}'`);
  return `INSERT INTO ${tableName} (${keys.join(",")}) VALUES (${values.join(
    ","
  )});`;
}

// array of js objects to sql insert statements
export function jsObjectsToSqlInsert(
  tableName: string,
  jsObjects: any[]
): string {
  const keys = Object.keys(jsObjects[0]);
  const values = jsObjects.map((jsObject) => {
    const values = keys.map((key) => `'${jsObject[key]}'`);
    return `(${values.join(",")})`;
  });
  return `INSERT INTO ${tableName} (${keys.join(",")}) VALUES ${values.join(
    ","
  )};`;
}

// array of js objects to sql insert statements and create table statement
export function jsObjectsToSqlInsertAndCreateTable(
  tableName: string,
  jsObjects: any[]
): string {
  const keys = Object.keys(jsObjects[0]);
  const values = jsObjects.map((jsObject) => {
    const values = keys.map((key) => `'${jsObject[key]}'`);
    return `(${values.join(",")})`;
  });
  return `CREATE TABLE ${tableName} (${keys.join(
    ","
  )}); INSERT INTO ${tableName} (${keys.join(",")}) VALUES ${values.join(
    ","
  )};`;
}
