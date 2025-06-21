const _ = require('lodash')
const { Types } = require('mongoose')

// Fix the ObjectId conversion to use the 'new' keyword
const convertToObjectId = id => new Types.ObjectId(id)

const getInfoData = ({fields = [], object = {}}) => {
    return _.pick(object,fields)
}   

const getSelectData = ( select = []) =>{
    return Object.fromEntries(select.map( el => [el,1] ))
}

module.exports = {
    getInfoData,
    getSelectData,
    convertToObjectId
}