export interface Track {
  id: string
  name: string
  path_lower: string
  size: number
  fileType: string
  artist: string
  album: string
  title: string
  duration?: number | null
  client_modified?: string
  server_modified?: string
  isMetadataLoading?: boolean
}

// Sample demo tracks with simulated durations
export const DEMO_TRACKS: Track[] = [
  {
    id: 'demo-1',
    name: 'Autumn Leaves.mp3',
    path_lower: '/music/jazz/autumn_leaves.mp3',
    size: 4200000,
    fileType: 'MP3',
    artist: 'Miles Davis',
    album: 'Kind of Blue Sessions',
    title: 'Autumn Leaves',
    duration: 245,
    client_modified: '2024-01-15T10:30:00Z',
    server_modified: '2024-01-15T10:30:00Z'
  },
  {
    id: 'demo-2',
    name: 'Bohemian Rhapsody.mp3',
    path_lower: '/music/rock/bohemian_rhapsody.mp3',
    size: 5800000,
    fileType: 'MP3',
    artist: 'Queen',
    album: 'A Night at the Opera',
    title: 'Bohemian Rhapsody',
    duration: 355,
    client_modified: '2024-01-10T14:22:00Z',
    server_modified: '2024-01-10T14:22:00Z'
  },
  {
    id: 'demo-3',
    name: 'Take Five.wav',
    path_lower: '/music/jazz/take_five.wav',
    size: 8900000,
    fileType: 'WAV',
    artist: 'Dave Brubeck Quartet',
    album: 'Time Out',
    title: 'Take Five',
    duration: 324,
    client_modified: '2024-01-20T09:15:00Z',
    server_modified: '2024-01-20T09:15:00Z'
  },
  {
    id: 'demo-4',
    name: 'Hotel California.m4a',
    path_lower: '/music/rock/hotel_california.m4a',
    size: 6200000,
    fileType: 'M4A',
    artist: 'Eagles',
    album: 'Hotel California',
    title: 'Hotel California',
    duration: 391,
    client_modified: '2024-01-18T16:45:00Z',
    server_modified: '2024-01-18T16:45:00Z'
  },
  {
    id: 'demo-5',
    name: 'Clair de Lune.flac',
    path_lower: '/music/classical/clair_de_lune.flac',
    size: 12500000,
    fileType: 'FLAC',
    artist: 'Claude Debussy',
    album: 'Suite Bergamasque',
    title: 'Clair de Lune',
    duration: 279,
    client_modified: '2024-01-12T11:30:00Z',
    server_modified: '2024-01-12T11:30:00Z'
  },
  {
    id: 'demo-6',
    name: 'Billie Jean.mp3',
    path_lower: '/music/pop/billie_jean.mp3',
    size: 4800000,
    fileType: 'MP3',
    artist: 'Michael Jackson',
    album: 'Thriller',
    title: 'Billie Jean',
    duration: 294,
    client_modified: '2024-01-14T13:20:00Z',
    server_modified: '2024-01-14T13:20:00Z'
  },
  {
    id: 'demo-7',
    name: 'So What.mp3',
    path_lower: '/music/jazz/so_what.mp3',
    size: 5100000,
    fileType: 'MP3',
    artist: 'Miles Davis',
    album: 'Kind of Blue',
    title: 'So What',
    duration: 562,
    client_modified: '2024-01-16T08:45:00Z',
    server_modified: '2024-01-16T08:45:00Z'
  },
  {
    id: 'demo-8',
    name: 'Stairway to Heaven.wav',
    path_lower: '/music/rock/stairway_to_heaven.wav',
    size: 9800000,
    fileType: 'WAV',
    artist: 'Led Zeppelin',
    album: 'Led Zeppelin IV',
    title: 'Stairway to Heaven',
    duration: 482,
    client_modified: '2024-01-11T15:30:00Z',
    server_modified: '2024-01-11T15:30:00Z'
  },
  {
    id: 'demo-9',
    name: 'Blue in Green.ogg',
    path_lower: '/music/jazz/blue_in_green.ogg',
    size: 3200000,
    fileType: 'OGG',
    artist: 'Miles Davis',
    album: 'Kind of Blue',
    title: 'Blue in Green',
    duration: 337,
    client_modified: '2024-01-17T12:15:00Z',
    server_modified: '2024-01-17T12:15:00Z'
  },
  {
    id: 'demo-10',
    name: 'The Sound of Silence.mp3',
    path_lower: '/music/folk/sound_of_silence.mp3',
    size: 3900000,
    fileType: 'MP3',
    artist: 'Simon & Garfunkel',
    album: 'Sounds of Silence',
    title: 'The Sound of Silence',
    duration: 198,
    client_modified: '2024-01-19T10:00:00Z',
    server_modified: '2024-01-19T10:00:00Z'
  }
]
