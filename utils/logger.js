'use strict'
require('dotenv').config()
const { APP_DEBUG, SLACK_WEBHOOK_URL } = process.env
const slack = require('slack-notify')(SLACK_WEBHOOK_URL)
const fs = require('fs')
const moment = require('moment')
const path = 'logs'

/**
 * This function creates a log file
 *
 * @param {string} type error|request|response
 * @param {string} name file name without extension
 * @param {object} [options={exception: '', params: '', url: ''}] [options={exception: '', params: '', url: ''}]
 */

exports.Log = (
  type,
  name,
  options = { exception: '', params: '', url: '' }
) => {
  const now = moment().format('YYYY-MM-DD')
  const logPath = `${path}/${now}`
  let file = ''
  if (APP_DEBUG) {
    // Creates log main directory if doesnt exist
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, (err) => {
        if (err) {
          return console.error(`Unable to create directory: ${err}`)
        }
        console.log('Directory was created successfuly')
      })
    }
    // Creates log date directory if doesnt exist
    if (!fs.existsSync(logPath)) {
      fs.mkdirSync(logPath, (err) => {
        if (err) {
          return console.error(`Unable to create directory: ${err}`)
        }
        console.log('Directory was created successfuly')
      })
    }

    if (typeof options.exception === 'object') {
      options.exception = JSON.stringify(options.exception)
    }

    if (typeof options.params === 'object') {
      options.params = JSON.stringify(options.params)
    }

    const logText = `-----------------------------------------------------------------------------------\n[${moment().format(
      'ddd, DD MMM YYYY HH:mm:ss ZZ'
    )}] Log ${type}:\n\nURL: ${options.url}\nParams: \n${options.params}\n\n${
      options.exception
    }\n\n`

    file = `${name}-${type}.log`
    fs.access(`${logPath}/${file}`, fs.F_OK, (err) => {
      if (err) {
        const writeStream = fs.createWriteStream(`${logPath}/${file}`)
        writeStream.write(logText)
        writeStream.on('finish', () => {
          console.log('Log file created successfuly')
        })
        writeStream.end()
        return
      }
      fs.appendFile(`${logPath}/${file}`, logText, (err) => {
        if (err) throw err
      })
    })
  }
}

/**
 * Slack logger this function sends all los to a slack channel
 *
 * @param {string} type error|success|alert|note
 * @param {string} title Title of the message
 * @param {string} message
 * @param {object} [options={ color: "#bb2124", icon: ":beetle:" }] { color: '#bb2124', icon: ':beetle:' }
 * @param {*} [exception=null] Exception message
 */
exports.LogSlack = (
  type,
  title,
  message,
  options = { color: '#bb2124', icon: ':beetle:' },
  exception = undefined
) => {
  if (typeof exception === 'object') {
    exception = JSON.stringify(exception)
  }

  const dateSection = {
    type: 'context',
    elements: [
      {
        text: moment().format('ddd DD MMM YYYY, h:mm a'),
        type: 'mrkdwn'
      }
    ]
  }

  const basic = {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${options.icon} Warning ${title}`
        }
      },
      {
        type: 'section',
        block_id: 'section789',
        fields: [
          {
            type: 'mrkdwn',
            text: `*${message}*`
          }
        ]
      },
      {
        type: 'divider'
      },
      dateSection
    ]
  }

  const attachments = {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${options.icon} Warning ${title}`
        }
      },
      {
        type: 'section',
        block_id: 'section789',
        fields: [
          {
            type: 'mrkdwn',
            text: `*${message}*`
          }
        ]
      }
    ],
    attachments: [
      {
        color: options.color,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '```' + exception + '```'
            }
          },
          {
            type: 'divider'
          },
          dateSection
        ]
      }
    ]
  }

  switch (type) {
    case 'error':
      slack.bug(typeof exception !== 'undefined' ? attachments : basic)
      break
    case 'success':
      slack.success(typeof exception !== 'undefined' ? attachments : basic)
      break
    case 'alert':
      slack.alert(typeof exception !== 'undefined' ? attachments : basic)
      break
    case 'note':
      slack.note(typeof exception !== 'undefined' ? attachments : basic)
      break
  }
}
