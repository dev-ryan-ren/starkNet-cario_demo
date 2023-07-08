# protostar
## 基本使用流程
```
protostar init your-project-name
protostar init-cario1 your-project-name

protostar test
protostar test ./tests/test_main.cairo

protostar build 

protostar calculate-account-address

protostar declare 
protostar deploy 
```
## 部署合约
1. 第次使用protostar，部署帐户
    - 【ACCOUNT_CLASS_HASH】: 浏览器中输入地址查看查看
```
protostar calculate-account-address --account-class-hash 【ACCOUNT_CLASS_HASH】 --account-address-salt 1 
```

2. 新建.env, 执行source .env,
```
env文件..
export PRIVATE_KEY="私钥"
export DEPLOY_ADDRESS= "钱包地址"
```

3. 私钥关联protostar到环境变量
    - 【PRIVATE_KEY】: 私钥 
```
export PROTOSTAR_ACCOUNT_PRIVATE_KEY=【PRIVATE_KEY】 
```

4. 声明合约
    - 【DEPLOY_ADDRESS】: 钱包地址
    - ./build/main.json 合约abi文件要放在指令最后(protostar build )
```
protostar declare --account-address 【DEPLOY_ADDRESS】 --max-fee auto --network testnet ./build/main.json

declare 成功显示,去浏览器中查看
Class hash: 0x02a5de1b145e18dfeb31c7cd7ff403714ededf5f3fdf75f8b0ac96f2017541bc
StarkScan https://testnet.starkscan.co/class/【Class hash】
Voyager   https://goerli.voyager.online/class/【Class hash】

Transaction hash: 0x0571e3fad496ce1ca82db373fb388ad62025cfc7728effce3b0c1116783ad13f
```

5. 部署合约
    - 【CLASS_HASH】 声明合约返回
    - 【DEPLOY_ADDRESS】 钱包地址
```
protostar deploy 【CLASS_HASH】 --network testnet --max-fee auto --account-address 【DEPLOY_ADDRESS WALLET】
```

# 运行项目
```
npm i
```

```
node test.mjs
```
