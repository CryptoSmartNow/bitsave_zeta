
const { task } = require("hardhat/config")
const envfile = require("envfile")
const fs = require("fs")

const main = async({save}, hre) => {
  const { privateKey, address } = hre.ethers.Wallet.createRandom();
  console.log(`\nprivate key: ${privateKey}`)
  console.log(`\npublic key: ${address}`)

  if (save) {
    const p = ".env";
    let env = envfile.parse(fs.existsSync(p) ?
      fs.readFileSync(p, "utf-8")
      :
      ""
    )

    env.PRIVATE_KEY = privateKey.slice(2); // private key starts after "04"
    fs.writeFileSync(p, envfile.stringify(env));
    console.log("Private key written to .env");
  }
}

task("account", "").addFlag("save").setAction(main)

