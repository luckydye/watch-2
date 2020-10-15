import PacketTypes from "./PacketTypes";

/*

Binary Format:

Data Block:
[block_id]
[block_data_in_sequence]

Arrays:
[array_length]
[data_block]
...

*/

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

export default class Packet {

    static read(arrayBuffer) {
        const dataView = new DataView(arrayBuffer);
        const dataObj = {};

        let byteIndex = 0;

        const readBlock = (dataObj) => {
            const packetId = dataView.getInt32(byteIndex);
            byteIndex += 4;

            for(let packetType in PacketTypes) {
                packetType = PacketTypes[packetType];
    
                if(packetType.id === packetId) {
                    for(let key in packetType.scheme) {
                        let dataType = packetType.scheme[key];

                        const dataValue = dataObj[key];
                        const isArray = dataType.substring(dataType.length - 2, dataType.length) == "[]";
                        
                        if(isArray) {
                            dataType = dataType.substring(0, dataType.length - 2);

                            const arrayLength = dataView.getInt32(byteIndex, true);
                            byteIndex += 4;

                            dataObj[key] = [];

                            for(let i = 0; i < arrayLength; i++) {
                                const dataSubObj = {};
                                dataObj[key].push(dataSubObj);
                                readBlock(dataSubObj);
                            }

                        } else {
                            switch(dataType) {
                                case 'string':
                                    let lastValue = null;
                                    let startIndex = byteIndex;
                                    while(lastValue !== 0x00) {
                                        const byte = dataView.getUint8(byteIndex, true);
                                        lastValue = byte;
                                        byteIndex++;
                                    }
                                    dataObj[key] = textDecoder.decode(arrayBuffer.slice(startIndex, byteIndex-1));
                                    break;
                                case 'int':
                                    dataObj[key] = dataView.getInt32(byteIndex, true);
                                    byteIndex += 4;
                                    break;
                                case 'float':
                                    dataObj[key] = dataView.getFloat32(byteIndex, true);
                                    byteIndex += 4;
                                    break;
                                case 'float3':
                                    dataObj[key] = [
                                        dataView.getFloat32(byteIndex, true),
                                        dataView.getFloat32(byteIndex + 4, true),
                                        dataView.getFloat32(byteIndex + 8, true),
                                    ]
                                    byteIndex += 4 * 3;
                                    break;
                                case 'float4':
                                    dataObj[key] = [
                                        dataView.getFloat32(byteIndex, true),
                                        dataView.getFloat32(byteIndex + 4, true),
                                        dataView.getFloat32(byteIndex + 8, true),
                                        dataView.getFloat32(byteIndex + 12, true),
                                    ]
                                    byteIndex += 4 * 4;
                                    break;
                            }
                        }
                    }
                    break;
                }
            }

            return dataObj;
        }
        
        return readBlock(dataObj);
    }

    constructor(type) {
        this.type = type;
        this.data = null;
        this.id = type.id;
    }

    write(dataObj, fixedBufferLength = 64) {
        this.value = dataObj;

        const dataView = new DataView(new ArrayBuffer(fixedBufferLength));

        let byteIndex = 0;

        const writeDataBlock = (dataObj, type) => {
            dataView.setInt32(byteIndex, type.id);
            byteIndex += 4;

            for(let key in type.scheme) {
                let dataType = type.scheme[key];

                const dataValue = dataObj[key];
                const isArray = dataType.substring(dataType.length - 2, dataType.length) == "[]";

                if(isArray) {
                    dataType = dataType.substring(0, dataType.length - 2);

                    const arrayLength = dataObj[key].length;

                    dataView.setInt32(byteIndex, arrayLength, true);
                    byteIndex += 4;

                    for(let data of dataObj[key]) {
                        writeDataBlock(data, PacketTypes[dataType]);
                    }

                } else {
                    switch(dataType) {
                        case 'string':
                            const data = textEncoder.encode(dataValue);
                            for(let value of data) {
                                dataView.setUint8(byteIndex, value, true);
                                byteIndex++;
                            }
                            dataView.setUint8(byteIndex, 0x00, true);
                            byteIndex++;
                            break;
                        case 'int':
                            dataView.setInt32(byteIndex, dataValue, true);
                            byteIndex += 4;
                            break;
                        case 'float':
                            dataView.setFloat32(byteIndex, dataValue, true);
                            byteIndex += 4;
                            break;
                        case 'float3':
                            dataView.setFloat32(byteIndex, dataValue[0], true);
                            dataView.setFloat32(byteIndex + 4, dataValue[1], true);
                            dataView.setFloat32(byteIndex + 8, dataValue[2], true);
                            byteIndex += 4 * 3;
                            break;
                        case 'float4':
                            dataView.setFloat32(byteIndex, dataValue[0], true);
                            dataView.setFloat32(byteIndex + 4, dataValue[1], true);
                            dataView.setFloat32(byteIndex + 8, dataValue[2], true);
                            dataView.setFloat32(byteIndex + 12, dataValue[3], true);
                            byteIndex += 4 * 4;
                            break;
                    }
                }
            }
        }

        writeDataBlock(dataObj, this.type);

        this.data = dataView.buffer;
    }

}
