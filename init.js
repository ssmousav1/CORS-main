const cmd = require("node-cmd");

try {
  cmd.run('sudo ./start.sh', (err, data, stderr) => {
    console.log('sudo ./start.sh', data)
    console.log('sudo ./start.sh', err)
    console.log('sudo ./start.sh', stderr)
    if (err) {
    } else {
      console.log(`success: sudo ./start.sh`);
      cmd.run('node config19.js', (err, data, stderr) => {
        console.log('node config19.js', data)
        console.log('node config19.js', err)
        console.log('node config19.js', stderr)
        if (err) {
        } else {
          console.log(`success: node config19.js`);
          cmd.run('node config115.js', (err, data, stderr) => {
            console.log('node config115.js', data)
            console.log('node config115.js', err)
            console.log('node config115.js', stderr)
            if (err) {
            } else {
              console.log(`success: node config115.js`);
            }
          }
          );
        }
      }
      );
    }
  }
  );
} catch (error) {
  console.log(error);
  process.exit();
}
