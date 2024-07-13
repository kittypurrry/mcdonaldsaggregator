/* eslint-disable @typescript-eslint/no-explicit-any */
import { extendConfig, subtask, task } from "hardhat/config";
import { crossdeployConfigExtender } from "./config";
import { networks, Network } from "./networks";
import {
  PLUGIN_NAME,
  TASK_VERIFY_SUPPORTED_NETWORKS,
  TASK_VERIFY_SIGNER,
  TASK_VERIFY_CONTRACT,
  TASK_VERIFY_GASLIMIT,
} from "./constants";
import "./type-extensions";

import { NomicLabsHardhatPluginError } from "hardhat/plugins";
import "@nomicfoundation/hardhat-ethers";

extendConfig(crossdeployConfigExtender);

task(
  "crossdeploy",
  "Deploys the contract across all predefined networks",
).setAction(async (_, hre) => {
  await hre.run(TASK_VERIFY_SUPPORTED_NETWORKS);
  await hre.run(TASK_VERIFY_SIGNER);
  await hre.run(TASK_VERIFY_CONTRACT);
  await hre.run(TASK_VERIFY_GASLIMIT);

  await hre.run("compile");

  if (hre.config.crossdeploy.contracts && hre.config.crossdeploy.contracts.length === 2) {
    const providers: any[] = [];
    const wallets: any[] = [];
    const signers: any[] = [];
   
    console.info("Deploying to:", hre.network.name);

    const incoNetwork: Network = networks["inco"] as Network;
    const targetNetwork: Network = networks[hre.network.name as keyof typeof networks] as Network;
    const nets = [incoNetwork, targetNetwork];
    
    [0, 1].map((i) => {
      providers[i] = new hre.ethers.JsonRpcProvider(
        nets[i].rpcUrl,
      );
      wallets[i] = new hre.ethers.Wallet(
        hre.config.crossdeploy.signer,
        providers[i],
      );
      signers[i] = wallets[i].connect(providers[i]);
    });

    const IncoContract = await hre.ethers.getContractFactory(
      hre.config.crossdeploy.contracts[0],
    );
    const OtherContract = await hre.ethers.getContractFactory(
      hre.config.crossdeploy.contracts[1],
    );

    try {
      console.info("Deploying contract on Inco...");
      const incoContractInstance: any = await IncoContract.connect(signers[0]).deploy();
      const incoContractAddr = await incoContractInstance.getAddress();
      
      await incoContractInstance.waitForDeployment();
      console.info("Contract address on Inco:", incoContractAddr);

      {
        console.info("Initializing contract on Inco...");
        const tx = await incoContractInstance.initialize(targetNetwork.chainId, incoContractAddr, incoNetwork.interchainExecuteRouterAddress);
        await tx.wait();
      }

      console.info("Deploying contract on target chain...");
      const otherContractInstance: any = await OtherContract.connect(signers[1]).deploy();
      const otherContractAddr = await otherContractInstance.getAddress();

      await otherContractInstance.waitForDeployment();
      console.info("Contract address on target chain:", otherContractAddr);

      {
        console.info("Initializing contract on target chain...");
        const tx = await otherContractInstance.initialize(incoNetwork.chainId, incoContractAddr, targetNetwork.interchainExecuteRouterAddress);
        await tx.wait();
      }

      {
        console.info("Setting owner for Inco contract...");
        const tx = await incoContractInstance.setCallerContract(await otherContractInstance.getICA());
        await tx.wait();
      }

      {
        console.info("Setting owner for target chain contract...");
        const tx = await otherContractInstance.setCallerContract(targetNetwork.interchainExecuteRouterAddress);
        await tx.wait();
      }

      console.info("Contract address on Inco:", incoContractAddr);
      console.info("Contract address on target chain:", otherContractAddr);

    } catch (err) {
      console.error(err);
    }

  }
});


subtask(TASK_VERIFY_SUPPORTED_NETWORKS).setAction(async (_, hre) => {
  if (
    !Object.keys(networks).includes(hre.network.name) ||
    hre.network.name === "inco"
  ) {
    throw new NomicLabsHardhatPluginError(
      PLUGIN_NAME,
      `The network you are trying to deploy to is not supported by this plugin.
      The currently supported networks are ${Object.keys(networks).filter(n => n !== "inco")}.`,
    );
  }
});

subtask(TASK_VERIFY_SIGNER).setAction(async (_, hre) => {
  if (!hre.config.crossdeploy.signer || hre.config.crossdeploy.signer === "") {
    throw new NomicLabsHardhatPluginError(
      PLUGIN_NAME,
      `Please provide a signer private key. We recommend using Hardhat configuration variables.
      See https://hardhat.org/hardhat-runner/docs/guides/configuration-variables.
      E.g.: { [...], crossdeploy: { signer: vars.get("PRIVATE_KEY", "") }, [...] }.`,
    );
  }
});

subtask(TASK_VERIFY_CONTRACT).setAction(async (_, hre) => {
  if (!hre.config.crossdeploy.contracts || hre.config.crossdeploy.contracts.length !== 2) {
    throw new NomicLabsHardhatPluginError(
      PLUGIN_NAME,
      `Please specify a pair of contract names to be deployed.
      E.g.: { [...], crossdeploy: { contracts: ["WERC20", "ERC20"] }, [...] }.`,
    );
  }
});

subtask(TASK_VERIFY_GASLIMIT).setAction(async (_, hre) => {
  if (
    hre.config.crossdeploy.gasLimit &&
    hre.config.crossdeploy.gasLimit > 15 * 10 ** 6
  ) {
    throw new NomicLabsHardhatPluginError(
      PLUGIN_NAME,
      `Please specify a lower gasLimit. Each block has currently 
      a target size of 15 million gas.`,
    );
  }
});
