const ledger = require('../src');
ledger
	.comm_node
	.create_async()
	.then(function(comm) {
			console.log(comm.device.getDeviceInfo());

			var ada = new ledger.ada(comm);

			/*
			ada.getWalletPublicKey_async("44'/1815'/0'/0'/0'").then(
		     function(result) {
					 console.log("Deriving Wallet Recovery Passphrase");
					 console.log(result);
				 }).fail(
		     function(error) { console.log(error); });


			ada.getRandomWalletPublicKey_async().then(
 		     function(result) {
					 console.log("Generating Random Public Key in address space");
					 console.log(result);
				 }).fail(
 		     function(error) { console.log(error); });


		  var testAddress = 0xFFFFFFFF;
			ada.getWalletPublicKeyFrom_async(testAddress).then(
		     function(result) {
					 console.log("Deriving Public Key from passed in address index");
					 console.log(result);
				 }).fail(
		     function(error) { console.log(error); });

			ada.getWalletIndex_async().then(
				 function(result) {
					 console.log("Deriving Wallet Index from device seed");
					 console.log(result);
				 }).fail(
				 function(error) { console.log(error); });
				 */
			var testTX = "839f8200d81858268258204806bbdfa6bbbfea0443ab6c301f6d7d04442f0a146877f654c08da092af3dd8193c508200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8bff9f8282d818585583581ce6e37d78f4326709af13851862e075bce800d06401ad5c370d4d48e8a20058208200581c23f1de5619369c763e19835e0cb62c255c3fca80aa13057a1760e804014f4e4ced4aa010522e84b8e70a121894001ae41ef3231b0075fae341e487158282d818585f83581cfd9104b3efb4c7425d697eeb3efc723ef4ff469e7f37f41a5aff78a9a20058208200581c53345e24a7a30ec701611c7e9d0593c41d6ea335b2eb195c9a0d2238015818578b485adc9d142b1e692de1fd5929acfc5a31332938f192011ad0fcdc751b0003d8257c6b4db7ffa0"
			ada.signTransaction_async(testTX).then(
					function(result) {
							console.log("Signing Transaction");
						  console.log(result);
					}).fail(
					function(error) { console.log(error); });

	})
	.catch(function(reason) {
		console.log('An error occured: ', reason);
	});
