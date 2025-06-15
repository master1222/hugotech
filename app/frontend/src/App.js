import './App.css';
import '@mantine/core/styles.css';
import 'mantine-datatable/styles.layer.css';
import {
  MantineProvider, SimpleGrid, Select, Container, Group,
  Checkbox, Modal, Button, ActionIcon, AppShell, Tooltip, Image
} from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { DataTable } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from "react-i18next";
import logo from "./LOGO.png"
import TrackModal from './modules/TrackModal';
import { notifications } from '@mantine/notifications';

export function App() {

  const [lessons, setLessons] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [libraries, setLibraries] = useState([]);
  const [openedModal, setOpenedModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [checked, setChecked] = useState(false);
  const [time, setTime] = useState('');
  const close = () => setOpenedModal(false)
  const languages = ['SK', 'CZ', 'HU', 'PL'];
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [editModal, setEditModal] = useState(true);
  var CSRF_TOKEN = '';
  const { i18n, t } = useTranslation();
  const [openedTrackModal, setOpenedTrackModal] = useState(false);


  useEffect(() => {
    fetchLessons();
    fetchTracks();
    fetchLibraries();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await axios.get('/api/v1/lessons');
      setLessons(await response.data);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      notifications.show({
        //message: 'Problém pri načítaní dát: Plánované hodiny',
        message: t("err_read_lessons"),
        color: 'red'
      })
    }
  };

  const fetchTracks = async () => {
    try {
      const response = await axios.get('/api/v1/tracks'); /*+ '/?language=' + selectedLanguage);*/
      setTracks(await response.data);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      notifications.show({
        //message: 'Problém pri načítaní dát: Zvukové stopy',
        message: t("err_read_tracks"),
        color: 'red'
      })
    }
  };

  const fetchLibraries = async () => {
    try {
      const response = await axios.get('/api/v1/libraries');
      setLibraries(await response.data);
    } catch (error) {
      console.error('Error fetching libraries:', error);
      notifications.show({
        //message: 'Problém pri načítaní dát: Knižnice',
        message: t("err_read_libraries"),
        color: 'red'
      })
    }
  };

  const getTableColumns = () => {
    return [{ accessor: 'time', title: t("time"), textAlign: 'left' },
    { accessor: 'track.name', title: t("track"), textAlign: 'left', render: (item) => (
      item.track.name + ' - ' + item.track.description
    ) },
    {
      accessor: 'bell', title: t("bell"), render: (item) => (
        <Checkbox disabled checked={item.bell}></Checkbox>
      )
    },
    { accessor: 'library.name', title: t("library"), textAlign: 'left', render: (item) => (
      item.library.name + ' - ' + item.library.description
    ) }];
  };

  const getTableData = () => {
    var a = lessons.map(lesson => ({
      id: lesson.id,
      time: lesson.time,
      track: lesson.track,
      bell: lesson.bell,
      library: lesson.library
    }));
    return a;
  };

  const renderModal = () => {

    return (
      <Modal
        opened={openedModal}
        onClose={close}
        title={t("entry_detail")}>
        <TimeInput mt="md" radius="lg" label={t("time")} placeholder="Input component" value={selectedLesson ? selectedLesson.time : null}
          onChange={(event) => {
            setTime(event.currentTarget.value);
            selectedLesson.time = event.currentTarget.value;
            setSelectedLesson(selectedLesson);
          }} />
        <Select
          allowDeselect={false}
          label={t("track")}
          mt="md"
          radius="lg"
          placeholder={t("chose_track")}
          data={tracks.map(track => ({ value: track.id.toString(), label: track.name + ' - ' + track.description }))}
          value={selectedTrack}
          onChange={(value) => {
            selectedLesson.track = tracks.find(track => track.id === Number(value));
            setSelectedLesson(selectedLesson);
            setSelectedTrack(value);
          }}
        />
        <Checkbox label={t("bell")} mt="md" checked={checked}
          radius="lg"
          value={selectedLesson ? selectedLesson.bell : false}
          description={t("bell_description")}
          style={{ marginTop: '10px' }}
          onChange={(event) => {
            setChecked(
              event.currentTarget.checked);
            selectedLesson.bell = event.currentTarget.checked;
            setSelectedLesson(selectedLesson);
          }} />
        <Select
          allowDeselect={false}
          label={t("library")}
          mt="md"
          radius="lg"
          placeholder={t("chose_library")}
          data={libraries.map(library => ({ value: library.id.toString(), label: library.name + ' - ' + library.description }))}
          value={selectedLibrary}
          onChange={(value) => {
            selectedLesson.library = libraries.find(lib => lib.id === Number(value));
            setSelectedLesson(selectedLesson);
            setSelectedLibrary(value);
          }}
        />
        <Group justify="center" mt="xl">
          {displayTrash()}
          <Button variant="filled" color="yellow" radius="md" onClick={() => onSaveLesson(selectedLesson)}>{t("save")}</Button>
        </Group>
      </Modal>
    )
  };

  const displayTrash = () => {
    if (editModal) {
      return (
        <Tooltip label={t("delete_entry")}>
          <ActionIcon variant="filled" color="red" aria-label="Settings" onClick={() => onDeleteLesson(selectedLesson)}>
            <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} /></ActionIcon>
        </Tooltip>
      )
    }
  }

  const handleRowClick = (lesson) => {

    setSelectedLesson(lesson);
    setChecked(lesson.bell);
    setTime(lesson.time);
    setSelectedTrack(lesson.track.id.toString());
    setSelectedLibrary(lesson.library.id.toString());
    setEditModal(true);
    setOpenedModal(true);
  };

  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      let cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();

        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  const onSaveLesson = (lesson) => {
    if (lesson) {
      // Here you would typically send the updated lesson data to your backend API
      if (lesson.id) {
        // Update existing lesson
        CSRF_TOKEN = getCookie('csrftoken');
        axios.put(`/api/v1/lessons/${lesson.id}/`, lesson, {
          headers: {
            'Content-Type': 'application/json',
            'x-csrftoken': CSRF_TOKEN
          }
        })
          .then(response => {
            console.log('Lesson updated successfully:', response.data);
            fetchLessons(); // Refresh the lessons after updating
            setOpenedModal(false);
            notifications.show({
              message: t("change_succ"),
              color: 'green'
            })
          })
          .catch(error => {
            notifications.show({
              title: t("error"),
              message: t("change_err"),
              color: 'green'
            })
            console.error('Error updating lesson:', error);
          });
      } else {
        // Create new lesson
        CSRF_TOKEN = getCookie('csrftoken');
        axios.post('/api/v1/lessons/', lesson, {
          headers: {
            'Content-Type': 'application/json',
            'x-csrftoken': CSRF_TOKEN
          }
        })
          .then(response => {
            console.log('Lesson saved successfully:', response.data);
            fetchLessons(); // Refresh the lessons after saving
            setOpenedModal(false);
            notifications.show({
              message: t("create_succ"),
              color: 'green'
            })
          })
          .catch(error => {
            console.error('Error saving lesson:', error);
            notifications.show({
              title: t("error"),
              message: t("create_err"),
              color: 'red'
            })
          });
      };
    }
  };

  const onDeleteLesson = (lesson) => {
    if (lesson) {
      // Here you would typically send a delete request to your backend API
      CSRF_TOKEN = getCookie('csrftoken');
      axios.delete(`/api/v1/lessons/${lesson.id}/`, {
        headers: {
          'Content-Type': 'application/json',
          'x-csrftoken': CSRF_TOKEN
        }
      })
        .then(response => {
          console.log('Lesson deleted successfully:', response.data);
          fetchLessons(); // Refresh the lessons after deleting
          setOpenedModal(false);
          notifications.show({
            message: t("delete_succ"),
            color: 'green'
          })
        })
        .catch(error => {
          console.error('Error deleting lesson:', error);
          notifications.show({
            title: t("error"),
            message: t("delete_err"),
            color: 'red'
          })
        });
    }
  };

  const onChangeLang = (e) => {
    i18n.changeLanguage(e.toLowerCase());
    setSelectedLanguage(e);
    fetchTracks();
  };

  return (
    <div className="App">
      <MantineProvider defaultColorScheme="dark">
        <AppShell
          header={{ height: 60 }}
          padding="md">
          <AppShell.Header>
            <div style={{ height: "10px" }}></div>
            <Container>
              <Group justify="space-between" style={{ height: '15px', width: '100%' }}>
                <Group justify="flex-start">
                  <a href="https://www.hugotech.sk/">
                    <Image h="80%" w="auto" fit="contain" src={logo} />
                  </a>
                </Group>
                <Group justify='flex-end'>
                  <Button variant="subtle" color="yellow" onClick={() => {
                    setOpenedTrackModal(true)
                  }}>{t("tracks_button")}</Button>
                  <form method="post" action="/accounts/logout/">
                    <input type="hidden" name="csrfmiddlewaretoken" value={getCookie("csrftoken")} />
                    <Button type="submit" variant="subtle" color="yellow">{t("logout")}</Button>
                  </form>
                  <Select allowDeselect={false} value={selectedLanguage} data={languages}
                    onChange={(event) => onChangeLang(event)} />
                </Group>
              </Group>
            </Container>
          </AppShell.Header>
          <AppShell.Main>
            <Container>
              <Group justify="flex-start">
                <Tooltip label={t("add_entry")}>
                  <ActionIcon variant="filled" color="yellow" aria-label="Settings" onClick={() => {
                    setSelectedLesson({ time: '', track: {}, bell: false, library: {} });
                    setChecked(false);
                    setTime('');
                    setSelectedTrack(null);
                    setSelectedLibrary(null);
                    setOpenedModal(true);
                    setEditModal(false);
                  }}>
                    <IconPlus style={{ width: '70%', height: '70%' }} stroke={1.5} />
                  </ActionIcon>
                </Tooltip>
              </Group>
              <SimpleGrid cols={{ base: 1, sm: 1 }} spacing="md" style={{ marginTop: '30px' }}>
                <DataTable
                  withTableBorder
                  borderRadius="sm"
                  highlightOnHover
                  columns={getTableColumns()}
                  records={getTableData()}
                  onRowClick={({ record, index, event }) => {
                    handleRowClick(record);
                  }}></DataTable>
              </SimpleGrid>
            </Container>
          </AppShell.Main>
        </AppShell>
        {renderModal()}
        <TrackModal openedTrackModal={openedTrackModal} close={setOpenedTrackModal} tracks={tracks} lang={t} />
      </MantineProvider>
    </div>
  );

};

export default App;


