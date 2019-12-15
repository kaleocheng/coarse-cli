const fs = require('fs').promises
const path = require('path')
const coarse = require('coarse')
const commander = require('commander')
const pkg = require('./package.json')



async function roughSVG(file, targetFile) {
  try {
    const svg = await fs.readFile(file)
    const roughened = coarse(svg, { fillStyle: 'solid' })
    await fs.writeFile(targetFile, roughened)
  } catch (err) {
    console.log('rough svg file failed', err)
  }
}


async function convertFromFolder(sourceDir, targetDir) {
    const sourceFiles = await fs.readdir(sourceDir)
    const targetFiles = await fs.readdir(targetDir)
    let files = sourceFiles.filter(x => !targetFiles.includes(x))
    files = files.filter(file => file.slice(-4) === '.svg')
    for (file of files) {
      await roughSVG(path.join(sourceDir, file), path.join(targetDir, file))
    }
}

async function main() {
  commander
      .name('coarse-cli <sourceFile> <targetFile>')
      .version(pkg.version)
      .option('--source-dir [dir]', 'convert all svg file in source dir, will ignore sourceFile/targetFile if --source-dir is passed')
      .option('--target-dir [dir]', 'output all svg to target dir, default is ./ ')
      .parse(process.argv)

  const sourceDir = commander.sourceDir
  const targetDir = commander.targetDir ? commander.targetDir : process.cwd()

  if (sourceDir) {
    await convertFromFolder(sourceDir, targetDir)
    process.exit()
  }

  if (commander.args.length !== 2) {
    commander.outputHelp()
    process.exit()
  }

  const sourceFile = commander.args[0]
  const targetFile = commander.args[1]
  await roughSVG(sourceFile, targetFile)

}

main()

