import { Provider, Contract, Account, ec,constants } from 'starknet';
import { ethers } from "ethers";
import 'dotenv/config';
const privateKey = process.env.PRIVATE_KEY;
const deployAddress = process.env.DEPLOY_ADDRESS;

const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });

const TEST_CONTRACT_ADDRESS = "0x0675e1297ba38a4e78b8249876282fea61509eb89d9e2737bbff4fc1988de953"
const TEST_ETHER_IMPLEMENTAION_ADDRESS = "0x000fa904eea70850fdd44e155dcc79a8d96515755ed43990ff4e7e7c096673e7"
const MAIN_ETHER_IMPLEMENTAION_ADDRESS = "0x048624e084dc68d82076582219c7ed8cb0910c01746cca3cd72a28ecfe07e42d"
const ETHER_PROXY_ADDRESS = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"

async function testContract() {
    // output chainId
    const chainId = await provider.getChainId();
    console.log("chainId: ", chainId);

    // read abi from contract address
    const { abi: testAbi } = await provider.getClassAt(TEST_CONTRACT_ADDRESS);
    // console.log("testAbi: ",testAbi);
    if (testAbi === undefined) { throw new Error("no abi") };

    // create contract instance
    const testContract = new Contract(testAbi, TEST_CONTRACT_ADDRESS, provider);
    // console.log("testContract: ",testContract);
    if (testContract === undefined) { throw new Error("no contract") };

    // get
    // call get_balance method
    const beforeBalance = await testContract.get_balance();
    console.log("beforeBalance: ", beforeBalance.res.toString()); // .res because the  return value is called 'res' in the cairo contract

    // Connect account with the contract
    const account = new Account(provider, deployAddress, privateKey);
    testContract.connect(account);
    // or you can use invoke
    // const result = await testContract.invoke("increase_balance", [668]);

    // 注意：set完不是及时上链，需要状态执行完以后再get
    const result = await testContract.increase_balance(668);
    console.log("set result: ", result);

    const afterBalance = await testContract.get_balance();
    console.log("afterBalance: ", afterBalance.res.toString());

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
    //     (it) => number.cleanHex(it.from_address) === number.cleanHex(TEST_CONTRACT_ADDRESS)
    //   ) || {data: []};
    // console.log("event: ", event);
}

async function getAccountInfo() {
    // output chainId
    const chainId = await provider.getChainId();
    console.log("chainId: ", chainId);

    let ether_imp_address;
    if (chainId == constants.StarknetChainId.SN_GOERLI) {
        ether_imp_address = TEST_ETHER_IMPLEMENTAION_ADDRESS;
    } else {
        ether_imp_address = MAIN_ETHER_IMPLEMENTAION_ADDRESS;
    }

    // get account nonce
    const nonce = await provider.getNonceForAddress(deployAddress)
    console.log("deployAddress nonce: ", Number(nonce));

    const { abi: ERC20ABI } = await provider.getClassAt(ether_imp_address);
    if (ERC20ABI === undefined) { throw new Error("no abi") };

    const testContract = new Contract(ERC20ABI, ETHER_PROXY_ADDRESS, provider);
    if (testContract === undefined) { throw new Error("no contract") };

    //get eth balance
    const balanceObj = await testContract.balanceOf(deployAddress);
    if (balanceObj === undefined || balanceObj.balance.low === undefined) { throw new Error("balanceOf fail") };
    const balanceBN = balanceObj.balance.low.toString();
    console.log("balance: ",ethers.utils.formatEther(balanceBN));
}

const main = async () => {
    // await testContract();
    await getAccountInfo();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
