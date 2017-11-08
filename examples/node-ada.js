const ledger = require('../src');
ledger
	.comm_node
	.create_async()
	.then(function(comm) {
		console.log(comm.device.getDeviceInfo());

		var ada = new ledger.ada(comm);

		ada.getWalletPublicKey_async("44'/1815'/0'").then(
		     function(result) { console.log(result);}).fail(
		     function(error) { console.log(error); });

		ada.getRandomWalletPublicKey_async().then(
		 		     function(result) { console.log(result);}).fail(
		 		     function(error) { console.log(error); });

	})
	.catch(function(reason) {
		console.log('An error occured: ', reason);
	});
