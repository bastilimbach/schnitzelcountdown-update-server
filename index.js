const fs = require('fs')
const { exec } = require('child_process')
const gitRepoURL = 'https://github.com/bastilimbach/wanngabesdasletztemalschnitzel.de.git'
const gitRepoPath = './countdown'
const indexHTML = `${gitRepoPath}/index.html`
const commitMessage = '[Bot] :tada: Update lastDateOfSchnitzel'

function prepareRepo(path) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(path)) {
      exec(`git -C ${path} reset --hard origin/HEAD`, (error, stdout, stderr) => {
        if (error) reject(stderr)

        exec(`git -C ${path} pull`, (error, stdout, stderr) => {
          (!error) ? resolve(stdout) : reject(stderr)
        })
      })
    } else {
      exec(`git clone ${gitRepoURL} ${path}`, (error, stdout, stderr) => {
        (!error) ? resolve(stdout) : reject(stderr)
      })
    }
  })
}

function pushChanges() {
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV === 'production') {
      exec(`git -C ${gitRepoPath} push -u origin master`, (error, stdout, stderr) => {
        (!error) ? resolve(gitRepoPath) : reject(stderr)
      })
    } else {
      resolve(gitRepoPath)
    }
  })
}

const update = () => {
  return new Promise((resolve, reject) => {
    prepareRepo(gitRepoPath).then(() => {
      fs.readFile(indexHTML, 'utf8', (readError, data) => {
        if (readError) reject(readError)

        const replacement = `var lastDateOfSchnitzel = new Date(${Date.now()})`
        const result = data.replace(/var lastDateOfSchnitzel = new Date\(.*\)/gm, replacement)
        fs.writeFile(indexHTML, result, 'utf8', (writeError) => {
          if (writeError) reject(writeError)

          exec(`git -C ${gitRepoPath} commit -a -m "${commitMessage}"`, (error, stdout, stderr) => {
            if (error) reject(stderr)
            pushChanges().then(() => { resolve() }).catch((pushError) => { reject(pushError) })
          })
        })
      })
    }).catch((error) => {
      reject(error)
    })
  })
}

const revert = () => {
  return new Promise((resolve, reject) => {
    prepareRepo(gitRepoPath).then(() => {
      exec(`git -C ${gitRepoPath} log --oneline --format=%B -n 1 HEAD | head -n 1`, (error, stdout, stderr) => {
        if (error) reject(stderr)

        if (stdout.replace(/(\r\n\t|\n|\r\t)/gm,"") === commitMessage) {
          exec(`git -C ${gitRepoPath} revert HEAD`, (error, stdout, stderr) => {
            if (error) reject(stderr)
            pushChanges().then(() => { resolve() }).catch((pushError) => { reject(pushError) })
          })
        } else {
          reject('Last commit was not commited by the update bot. Can not revert.')
        }
      })
    }).catch((error) => {
      reject(error)
    })
  })
}

module.exports = { update, revert }
