import { Handle, Position } from 'reactflow';

const CustomNode = ({ data }: any) => {
    return (
        <div
            style={{
                padding: 2,
                border: '2px solid #333',
                borderRadius: 8,
                background: '#f3f3f3',
                minWidth: 30,
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: 12,
                lineHeight: 1,
            }}
        >
            <Handle
                type="target"
                position={Position.Left}
                style={{ background: 'blue', width: 8, height: 8 }}
            />
            {data.label}
            <Handle
                type="source"
                position={Position.Right}
                style={{ background: 'green', width: 8, height: 8 }}
            />
        </div>
    );
};

export default CustomNode;
