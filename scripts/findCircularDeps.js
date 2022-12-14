const exec = require('child_process').execSync;

let output = exec('yarn workspaces info --json').toString().replace(/^(.|\n)*?\{/, '{').replace(/\}\nDone in .*\n?$/, '}');
let workspaces = JSON.parse(output);

for (let pkg in workspaces) {
  addDep(pkg);
}

function addDep(dep, seen = new Set()) {
  if (seen.has(dep)) {
    let arr = [...seen];
    let index = arr.indexOf(dep);
    // ok for pkg to depend on itself
    if (arr.slice(index).length > 1) {
      console.log(`Circular dependency detected: ${arr.slice(index).join(' -> ')} -> ${dep}`);
      process.exit(1);
    } else {
      return;
    }
  }

  seen.add(dep);

  for (let d of workspaces[dep].workspaceDependencies) {
    addDep(d, seen);
  }

  seen.delete(dep);
}
