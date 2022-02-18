const OPCUAClient = require('node-opcua');

exports.getTipo = (tipo) => {
    switch (tipo) {
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

exports.converter = (tipo, valor) => {
    switch (tipo) {
        case 'int16':
            return parseInt(valor);
        break;
        case 'int32':
            return parseInt(valor);
        break;
        case 'string':
            if(valor == 0) {
                return ''; 
            } else {
                 return String(valor);
            }
        break;
        case 'uint16':
            return parseInt(valor);
        break;
        case 'uint32':
            return parseInt(valor);
        break;
        case 'real32':
            return parseFloat(valor);
        break;
    }
}