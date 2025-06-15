import { Table, Modal } from '@mantine/core';

function TrackModal(props) {

    const readTracks = () => {
        return props.tracks.map((element) => (
            <Table.Tr>
                <Table.Td>{element.name}</Table.Td>
                <Table.Td>{element.description}</Table.Td>
            </Table.Tr>
        ))
    }

    return (
        <Modal
            opened={props.openedTrackModal}
            onClose={() => {
                props.close();
            }}
            title={props.lang("track_list")}>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>{props.lang("track_name")}</Table.Th>
                        <Table.Th>{props.lang("track_desc")}</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {readTracks()}
                </Table.Tbody>
            </Table>

        </Modal>
    );
};

export default TrackModal;