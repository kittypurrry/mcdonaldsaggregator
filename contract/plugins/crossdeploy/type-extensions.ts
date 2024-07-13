import "hardhat/types/config";
import { crossDeployConfig } from "./types";

declare module "hardhat/types/config" {
  interface HardhatUserConfig {
    crossdeploy?: crossDeployConfig;
  }

  interface HardhatConfig {
    crossdeploy: crossDeployConfig;
  }
}
