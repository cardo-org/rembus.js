import WebSocket from 'isomorphic-ws';
import 'fake-indexeddb/auto';
import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.WebSocket = WebSocket;
