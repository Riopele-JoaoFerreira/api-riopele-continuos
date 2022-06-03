const OPCUAClient = require('node-opcua');

exports.getType = (type) => {
    switch (type) {
        case 'int16':
            return { dataType: OPCUAClient.DataType.Int16 };
        break;
        case 'int32':
            return { dataType: OPCUAClient.DataType.Int32 };
        break;
        case 'string':
            return { dataType: OPCUAClient.DataType.String };
        break;
        case 'uint16':
            return { dataType: OPCUAClient.DataType.UInt16 };
        break;
        case 'uint32':
            return { dataType: OPCUAClient.DataType.UInt32 };
        break;
        case 'real32':
            return { dataType: OPCUAClient.DataType.Float };
        break;
    }
}

exports.convert = (type, value) => {
    switch (type) {
        case 'int16':
            return parseInt(value);
        break;
        case 'int32':
            return parseInt(value);
        break;
        case 'string':
            if(value == 0) {
                return ''; 
            } else {
                 return String(value);
            }
        break;
        case 'uint16':
            return parseInt(value);
        break;
        case 'uint32':
            return parseInt(value);
        break;
        case 'real32':
            return parseFloat(value);
        break;
    }
}