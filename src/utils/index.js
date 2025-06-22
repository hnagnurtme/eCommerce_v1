const _ = require('lodash')
const { Types } = require('mongoose')

const convertToObjectId = (id) => {
    if (!id || !Types.ObjectId.isValid(id)) {
        throw new Error(`❌ Invalid ObjectId: ${JSON.stringify(id)}`);
    }
    return new Types.ObjectId(id);
};

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