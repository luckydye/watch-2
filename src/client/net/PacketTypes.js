export default {

    PlayerInput: {
        id: 0x001,
        scheme: {
            input: "float4",
            rotation: "float4",
        }
    },

    Entity: {
        id: 0x002,
        scheme: {
            id: "string",
            position: "float3",
            velocity: "float3",
            rotation: "float3",
        }
    },

    SceneState: {
        id: 0x003,
        scheme: {
            enteties: "Entity[]",
        }
    }

}
