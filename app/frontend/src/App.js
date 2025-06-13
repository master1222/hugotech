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
import { IconPlus, IconTrash} from '@tabler/icons-react';
import { useTranslation } from "react-i18next";
import logo from "./LOGO.png"





export function App() {

  if (useState === undefined) {
    throw new Error('React.useState is not defined. Please ensure you are using a compatible version of React.');
  }

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


  useEffect(() => {
    fetchLessons();
    fetchTracks();
    fetchLibraries();
    return () => {
      // Cleanup function if needed
      setLessons([]);
      setTracks([]);
      setLibraries([]);
      setOpenedModal(false);
      setSelectedLesson(null);
      setChecked(false);
      setTime('');
    }
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await axios.get('/api/v1/lessons');
      setLessons(await response.data);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const fetchTracks = async () => {
    try {
      const response = await axios.get('/api/v1/tracks'); /*+ '/?language=' + selectedLanguage);*/
      setTracks(await response.data);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  const fetchLibraries = async () => {
    try {
      const response = await axios.get('/api/v1/libraries');
      setLibraries(await response.data);
    } catch (error) {
      console.error('Error fetching libraries:', error);
    }
  };

  const getTableColumns = () => {
    return [{ accessor: 'time', title: 'Čas', textAlign: 'left' },
    { accessor: 'track.name', title: 'Zvuková stopa', textAlign: 'left' },
    {
      accessor: 'bell', title: 'Zvonček', render: (item) => (
        <Checkbox disabled checked={item.bell}></Checkbox>
      )
    },
    { accessor: 'library.name', title: 'Knižnica', textAlign: 'left' }];
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
        title='Detail hodiny'>
        <TimeInput mt="md" radius="lg" label="Čas" placeholder="Input component" value={selectedLesson ? selectedLesson.time : null}
          onChange={(event) => {
            setTime(event.currentTarget.value);
            selectedLesson.time = event.currentTarget.value;
            setSelectedLesson(selectedLesson);
          }} />
        <Select
          allowDeselect={false}
          label="Zvuková stopa"
          mt="md"
          radius="lg"
          placeholder="Vyberte zvukovú stopu"
          data={tracks.map(track => ({ value: track.id.toString(), label: track.name + ' ' + track.description }))}
          value={selectedTrack}
          onChange={(value) => {
            selectedLesson.track = tracks.find(track => track.id === Number(value));
            setSelectedLesson(selectedLesson);
            setSelectedTrack(value);
          }}
        />
        <Checkbox label="Zvonček" mt="md" checked={checked}
          radius="lg"
          value={selectedLesson ? selectedLesson.bell : false}
          description="Zvonček sa spustí na začiatku zvoleného času"
          style={{ marginTop: '10px' }}
          onChange={(event) => {
            setChecked(
              event.currentTarget.checked);
            selectedLesson.bell = event.currentTarget.checked;
            setSelectedLesson(selectedLesson);
          }} />
        <Select
          allowDeselect={false}
          label="Knižnica"
          mt="md"
          radius="lg"
          placeholder="Vyberte knižnicu"
          data={libraries.map(library => ({ value: library.id.toString(), label: library.name }))}
          value={selectedLibrary}
          onChange={(value) => {
            selectedLesson.library = libraries.find(lib => lib.id === Number(value));
            setSelectedLesson(selectedLesson);
            setSelectedLibrary(value);
          }}
        />
        <Group justify="center" mt="xl">
          {displayTrash()}
          <Button variant="filled" color="yellow" radius="md" onClick={() => onSaveLesson(selectedLesson)}>Uložiť</Button>
        </Group>
      </Modal>
    )
  };

  const displayTrash = () => {
    if (editModal) {
      return (
        <Tooltip label="Vymazať záznam">
          <ActionIcon variant="outline" color="red" aria-label="Settings" onClick={() => onDeleteLesson(selectedLesson)}>
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
          })
          .catch(error => {
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
          })
          .catch(error => {
            console.error('Error saving lesson:', error);
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
        })
        .catch(error => {
          console.error('Error deleting lesson:', error);
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
            <Container>
              <Group justify="space-between" style={{ height: '10px', width: '100%' }}>
                <Group justify="flex-start">
                  <Image h="60%" w="auto" fit="contain" src={logo}></Image>
                  <h2 style={{ marginLeft: '10px', color: '#e09f07' }} href="https://google.sk">{t("home")}</h2>
                </Group>  
                <Group justify='flex-end'>
                  <Button variant="subtle" color="yellow">Zvukové stopy</Button>
                  <form method="post" action="/accounts/logout/">
                    <input type="hidden" name="csrfmiddlewaretoken" value={getCookie("csrftoken")} />
                    <Button type="submit" variant="subtle" color="yellow">Odhlásiť</Button>
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
                <Tooltip label="Pridať záznam">
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
      </MantineProvider>
    </div>
  );

};

export default App;


