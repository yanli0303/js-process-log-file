const trim = lines => lines.map(line => line.trim())
const noBlank = lines => lines.filter(line => line.length > 0)
const replace = (line, pattern, substitute) => {
  const matches = line.match(pattern)
  if (!matches) {
    return null
  }

  let result = substitute
  let match = true
  for (let i = 0; match; i += 1) {
    match = matches[i]
    if (match) {
      result = result.replace(`$${i}`, match)
    }
  }

  return result
}

// See File API" https://developer.mozilla.org/en-US/docs/Web/API/File
// file.name, file.size, file.lastModifiedDate, file.type
const readFileContents = async file => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onloadend = (e) => {
    if (reader.error) {
      reject(reader.error)
    } else {
      resolve(e.target.result)
    }
  }
  reader.readAsText(file)
})

const parseOptions = () => {
  const pattern = document.querySelector('#replace-pattern').value
  return {
    noBlank: document.querySelector('#delete-blank-lines').checked,
    trim: document.querySelector('#delete-blank-lines').checked,
    pattern: pattern ? new RegExp(pattern) : null,
    substitute: document.querySelector('#replace-with').value
  }
}

const processFiles = (files) => {
  const fileList = document.querySelector('#files')
  fileList.innerHTML = ''

  const options = parseOptions()

  for (const file of files) {
    readFileContents(file)
      .then((text) => {
        let logs = text.split(/\r\n|\r|\n/)
        fileList.innerHTML += `<li>${file.name}, Date Modified: ${file.lastModifiedDate.toISOString()}, lines: ${logs.length}</li>`

        if (trim) {
          logs = trim(logs)
        }

        if (options.noBlank) {
          logs = noBlank(logs)
        }

        if (options.pattern && options.substitute) {
          logs = logs
            .map(line => replace(line, options.pattern, options.substitute))
            .filter(Boolean)
        }

        document.querySelector('#output').value = logs.join('\r\n')
      })
  }
}

const upload = document.querySelector('#upload')
upload.addEventListener('dragover', (event) => {
  event.preventDefault()
  event.stopPropagation()
  event.dataTransfer.dropEffect = 'copy'
}, false)

upload.addEventListener('dragenter', (event) => {
  event.preventDefault()
  event.stopPropagation()
  event.target.style.background = '#eeeeee'
}, false)

upload.addEventListener('dragleave', (event) => {
  event.preventDefault()
  event.stopPropagation()
  event.target.style.background = '#ffffff'
}, false)

upload.addEventListener('drop', (event) => {
  event.preventDefault()
  event.stopPropagation()
  processFiles(event.dataTransfer.files)
}, false)
