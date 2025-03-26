import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { collectionData, collection, addDoc, Firestore, DocumentReference, CollectionReference, doc, docData,deleteDoc, setDoc } from '@angular/fire/firestore';
import { Song } from '../../models/song.interface';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private readonly songCollection: CollectionReference<Song>;

  constructor(private readonly firestore: Firestore) {
    this.songCollection = collection(this.firestore, 'songList') as CollectionReference<Song>;
  }

  createSong(
    albumName: string,
    artistName: string,
    songDescription: string,
    songName: string
  ): Promise<DocumentReference<Song>> {
    const newSong :any= { albumName, artistName, songDescription, songName };
    return addDoc<Song, any>(this.songCollection, newSong).then((docRef: DocumentReference<Song>) => {
      // Use setDoc to add the id field
      return setDoc(docRef, { id: docRef.id }, { merge: true })
      .then(() => docRef);
    });
  }

  getSongList(): Observable<Song[]> {
    return collectionData<Song>(this.songCollection);
  }
  
  getSongDetail(songId: string): Observable<Song | undefined> {
    const songRef = doc(this.firestore, `songList/${songId}`) as DocumentReference<Song>;
    return docData<Song>(songRef);
  }

  deleteSong(songId: string): Promise<void> {
    const songDocRef = doc(this.firestore, `songList/${songId}`);
    return deleteDoc(songDocRef);
  }
}
