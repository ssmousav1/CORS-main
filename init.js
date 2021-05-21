const cmd=require('node-cmd');

//*nix supports multiline commands



    cmd.run(
        `sudo ./start.sh
	ls`,
        function(err, data, stderr){
            console.log('examples dir now contains the example file along with : ',data)
		
		console.log(stderr,'**********')
		if(err){
			console.log(err)
		
		}else{
			console.log('$$$$$$$$')
			cmd.run(
                                `node config.js`,
                        function(err, data, stderr){
                                console.log('examples dir now contains the example file along with : ',data)
                                }
                        );

		}

        }
    );

