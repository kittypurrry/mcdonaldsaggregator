import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployed = await deploy("JobListingsInco", {
    from: deployer,
    args: [],
    log: true,
  });

  console.log(`JobListingsInco contract: `, deployed.address);
};
export default func;
func.id = "deploy_JobListingsInco"; // id required to prevent reexecution
func.tags = ["JobListingsInco"];