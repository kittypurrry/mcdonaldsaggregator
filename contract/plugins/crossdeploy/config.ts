import { ConfigExtender } from "hardhat/types";
import { GASLIMIT } from "./constants";

export const crossdeployConfigExtender: ConfigExtender = (config, userConfig) => {
  const defaultConfig = {
    contracts: [],
    signer: undefined,
    gasLimit: GASLIMIT,
  };

  if (userConfig.crossdeploy) {
    const customConfig = userConfig.crossdeploy;
    config.crossdeploy = {
      ...defaultConfig,
      ...customConfig,
    };
  } else {
    config.crossdeploy = defaultConfig;
  }
};
