// 1. npm i
// 2. node test_starknet.mjs

import {Provider, Contract, Account, ec, number} from 'starknet';
import 'dotenv/config';
const provider = new Provider({ sequencer: { network: 'goerli-alpha' } }) // for testnet 1

const privateKey = process.env.PRIVATE_KEY;
const deployAddr = "0x0181eA9cAf176F54D153946eeb2154729734A39f970a45559b2a66021e84d683";
const testAddress = "0x0675e1297ba38a4e78b8249876282fea61509eb89d9e2737bbff4fc1988de953"

const main = async () => {
    // output chainId
    const chainId = await provider.getChainId();
    console.log("chainId: ", chainId);

    // geint account nonce
    const nonce = await provider.getNonceForAddress(deployAddr)
    console.log("deployAddr nonce: ",Number(nonce));

    // read abi from contract address
    const { abi: testAbi } = await provider.getClassAt(testAddress);
    // console.log("testAbi: ",testAbi);
    if (testAbi === undefined) { throw new Error("no abi") };
    
    // create contract instance
    const testContract = new Contract(testAbi, testAddress, provider);
    // console.log("testContract: ",testContract);
    if (testContract === undefined) { throw new Error("no contract") };

    // get
    // call get_balance method
    const beforeBalance = await testContract.get_balance();
    // const beforeBalance1 = await testContract.call("get_balance");
    console.log("beforeBalance: ", beforeBalance.toString()); // .res because the  return value is called 'res' in the cairo contract
    // console.log("beforeBalance1 =", beforeBalance1.toString()); // .res because the  return value is called 'res' in the cairo contract

    // set
    const starkKeyPair = ec.getKeyPair(privateKey);
    const account = new Account(provider, deployAddr, starkKeyPair);
    // Connect account with the contract
    testContract.connect(account);
    // or you can use invoke
    // const result = await testContract.invoke("increase_balance", [668]);
    const result = await testContract.increase_balance(668);
    console.log("set result: ", result);

    // 注意：set完不是及时上链，需要状态执行完以后再get

    const afterBalance = await testContract.get_balance();
    console.log("afterBalance: ", afterBalance.toString());

    const txReceiptDeployTest = await provider.waitForTransaction(result.transaction_hash);
    console.log("txReceiptDeployTest: ", txReceiptDeployTest);

    // account.execute: when you interacat with the function that need the proof that you have the private key of the account.
    // const executeHash = await account.execute(
    //     {
    //       contractAddress: myContractAddress,
    //       entrypoint: 'transfer',
    //       calldata: stark.compileCalldata({
    //         recipient: receiverAddress,
    //         amount: ['10']
    //       })
    //     }
    //   );
    // await provider.waitForTransaction(executeHash.transaction_hash);
    
    // Events
    // there are multiple events in the tx, because ERC20 and argent tx also emit events.
    // we need to filter out the event that we care    
    // const events = txReceiptDeployTest.events;
    // const event = events.find(
    //     (it) => number.cleanHex(it.from_address) === number.cleanHex(testAddress)
    //   ) || {data: []};
    // console.log("event: ", event);
}
main()