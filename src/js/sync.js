// https://stackoverflow.com/questions/36152857/how-to-get-folder-path-using-electron
const {dialog} = require('electron').remote
// console.log('Starting directory: ' + process.cwd())
const {spawn} = require('child_process')

const defaults = require('./config/defaults.json')

// Elements
const syncButton = document.querySelector('.sync')
const syncButtonIcon = document.querySelector('.fa-sync-alt')
const cancelButton = document.querySelector('.cancel')
const excludeCheckbox = document.querySelector('.exclude')
const deleteCheckbox = document.querySelector('.delete')
const sourceInput = document.querySelector('.source')
const destinationInput = document.querySelector('.destination')
const outputTextArea = document.querySelector('.output')

const checkInputs = () => {
    syncButton.disabled = (sourceInput.value && destinationInput.value) ? false : true
}

// https://stackoverflow.com/questions/20643470/execute-a-command-line-binary-with-node-js
const sync = () => {

    syncButton.disabled = true

    const source = `${sourceInput.value}/`
    const destination = destinationInput.value
    const exclude_option = excludeCheckbox.checked ? `--exclude-from=${__dirname}/config/exclude.txt` : null
    const delete_option = deleteCheckbox.checked ? '--delete-excluded' : null

    console.log('Source: ' + source)
    console.log('Destination: ' + destination)
    console.log('Exclude Option: ' + exclude_option)
    console.log('Delete Option: ' + delete_option)
    console.log('Syncing...')

    const cmd = `${__dirname}/rsync/bin/rsync`
    let args = [ 
        '-azv', // u
        // '--info=PROGRESS2',
        exclude_option, 
        delete_option,
        source, 
        destination
    ]

    // Filter out null args
    args = args.filter((arg) => { return arg ? true : false })

    console.log(cmd, args)
    
    const rsync = spawn(cmd, args)

    rsync.stdout.on('data', (data) => {
        cancelButton.classList.remove('d-none')
        syncButtonIcon.classList.add('fa-spin')
        // console.log(`${data}`)
        outputTextArea.value = data
        outputTextArea.scrollTop = outputTextArea.scrollHeight 
    })

    rsync.stderr.on('data', (data) => {
        cancelButton.classList.remove('d-none')
        syncButtonIcon.classList.add('fa-spin')
        // console.log(`${data}`)
        outputTextArea.value = data
        outputTextArea.scrollTop = outputTextArea.scrollHeight 
    })

    rsync.on('close', (code) => {
        syncButton.disabled = false
        cancelButton.classList.add('d-none')
        syncButtonIcon.classList.remove('fa-spin')
        console.log(`Child process exited with code ${code}`)
    })

    cancelButton.addEventListener('click', (event) => {
        event.preventDefault()
        rsync.kill('SIGINT')
    })
}

// Init

// Source
sourceInput.addEventListener('click', (event) => {
    let path = dialog.showOpenDialog({
        properties: ['openDirectory']
    })
    sourceInput.value = path || sourceInput.value
    // console.log('Source: ' + path)
    checkInputs()
})

// Destination
destinationInput.addEventListener('click', (event) => {
    let path = dialog.showOpenDialog({
        properties: ['openDirectory']
    })
    destinationInput.value = path || destinationInput.value
    // console.log('Source: ' + path)
    checkInputs()
})

// Defaults
sourceInput.value = defaults.source
destinationInput.value = defaults.destination
excludeCheckbox.checked = defaults.exclude
deleteCheckbox.checked = defaults.delete

// Init
checkInputs()

// Button
syncButton.addEventListener('click', (event) => {
    event.preventDefault()
    sync()
})
