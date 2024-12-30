const GAMEMASTERS = [
    { id: 1, name: 'John', trained_rooms: [2, 3, 5] },
    { id: 2, name: 'Alice', trained_rooms: [4, 10] },
    { id: 3, name: 'David', trained_rooms: [5] },
    { id: 4, name: 'Emily', trained_rooms: [8, 6, 2, 7] },
    { id: 5, name: 'Michael', trained_rooms: [9, 1, 4, 3, 11, 8, 6, 12] },
    { id: 6, name: 'Sophia', trained_rooms: [7, 10] },
    { id: 7, name: 'Daniel', trained_rooms: [8] },
    { id: 8, name: 'Olivia', trained_rooms: [3, 9] },
    { id: 9, name: 'Matthew', trained_rooms: [2, 6, 1, 7, 3, 4] },
    { id: 10, name: 'Emma', trained_rooms: [5, 4] },
    { id: 11, name: 'James', trained_rooms: [11, 6] },
    { id: 12, name: 'Isabella', trained_rooms: [7, 4, 12] },
    { id: 13, name: 'William', trained_rooms: [11, 12] },
    { id: 14, name: 'Ava', trained_rooms: [9, 11, 10] },
    { id: 15, name: 'Benjamin', trained_rooms: [8, 4] },
    { id: 16, name: 'Mia', trained_rooms: [1, 3, 7, 5, 8] },
    { id: 17, name: 'Ethan', trained_rooms: [4, 2] },
    { id: 18, name: 'Charlotte', trained_rooms: [10] },
    { id: 19, name: 'Alexandre', trained_rooms: [9, 2, 8] },
    { id: 20, name: 'Harper', trained_rooms: [1, 12] }
]

const ROOMS = [
    { id: 1, name: "Le Braquage à la française" },
    { id: 2, name: "Le Braquage de casino" },
    { id: 3, name: "L'Enlèvement" },
    { id: 4, name: "Le Métro" },
    { id: 5, name: "Les Catacombes" },
    { id: 6, name: "Assassin's Creed" },
    { id: 7, name: "L'Avion" },
    { id: 8, name: "La Mission spatiale" },
    { id: 9, name: "Le Tremblement de terre" },
    { id: 10, name: "Le Cinéma hanté" },
    { id: 11, name: "Le Farwest" },
    { id: 12, name: "Mission secrète" }
]

// Tirage aléatoire des Game Masters
const random_gamemaster_array = size => GAMEMASTERS.sort(() => Math.random() - 0.5).slice(0, size)

// Checks if a given room exists for other gamemasters
function  trainedRoomisUnique(trained_room, gamemasters) {
    let     isUnique = true

    gamemasters.forEach((element) => {
        element.trained_rooms.forEach((roomID) => {
            if ( trained_room === roomID ) {
                isUnique = false; // Room is not unique
            }
        });
    });
    if ( isUnique )
        return true; // Room is unique
    return false; // Room is not unique
}

// Checks if a given room is booked.
function roomIsBooked(booked_rooms, roomID) {
    for (const booked_roomID of booked_rooms) {
        if (booked_roomID === roomID) {
            return true; // Exit the function as soon as a match is found
        }
    }
    return false; // No match found
}

// Helper function to add a gamemaster to the session
function addGamemasterToSession(sessions, booked_rooms, gamemaster, roomID) {
    sessions[roomID - 1].gamemaster = gamemaster;
    booked_rooms.push(roomID);
}

/*
 * Assign a session to each Game Master
 * - Array of Game Master is sorted by lengh of trained rooms.
 * - Each Game Master with unique room is assigned to a session and deleted.
 * - New version of Game Masters with potentially new unique room.
 * - Add Game Masters with unique room that has not been booked to Session. If no unique room exists, the Game Master with unbooked room will be added.
 *   (Maybe optimzable by adding first Game Master with unique room)
*/
function setGMToSession(gamemasters, sessions, rooms) {
    const   booked_rooms = []
    // Sort gamemaster array by lenght of trained rooms
    gamemasters.sort((a, b) => a.trained_rooms.length - b.trained_rooms.length);

    // Add single-room Game Masters and unique trained rooms to the session.
    for ( let x = 0; x < gamemasters.length; x++ ) {
        let     unique = 0
        // Add Game Master to Session only if one Room is known
        if ( gamemasters[x].trained_rooms.length === 1 ) {
            const gm_trained_room   = gamemasters[x].trained_rooms[0];
            // Add Game Master to Session and Room to Booked Rooms
            addGamemasterToSession(sessions, booked_rooms, gamemasters[x], gm_trained_room);
            // Remove current Game Master
            gamemasters.splice(x, 1);
            x--;
        }
        // Add Game Master with a unique room to the session that hasn't been booked yet.
        else {
            for (const trainedRoom of gamemasters[x].trained_rooms) {
                if ( !roomIsBooked(booked_rooms, trainedRoom) && trainedRoomisUnique(trainedRoom, gamemasters.filter((gm, index) => index !== x))) {
                    unique++;
                    // If two rooms are unique, exception is thrown.
                    if ( unique > 1 )
                        throw new Error(`Impossible Attribution for ${gamemasters[x].name} : roomID : ${trainedRoom}`);
                    addGamemasterToSession(sessions, booked_rooms, gamemasters[x], trainedRoom);
                }
            }
            if ( unique === 1 ) {
                // Remove current Game Master
                gamemasters.splice(x, 1);
                x--;
            }
        }
    }

    // Add Game Master to session if room is unique or, add a room that hasn't been booked yet.
    for ( let x = 0; x < gamemasters.length; x++ ) {
        let unique  = 0;
        let trainedRoomIndex = 0;
        let added = false;
        for (const trainedRoom of gamemasters[x].trained_rooms) {
            // If Unique Room exists on available rooms add gamemaster to Session
            if (!roomIsBooked(booked_rooms, trainedRoom) && trainedRoomisUnique(trainedRoom, gamemasters.filter((gm, index) => index !== x)) ) {
                unique++;
                // If two rooms are unique, exception is throwed.
                if ( unique > 1 )
                    throw new Error(`Impossible Attribution for ${gamemasters[x].name} : roomID : ${trainedRoom}`);
                trainedRoomIndex = trainedRoom;
                added = true;
            }
            // If Room is not unique and not booked add gamemaster to Session
            else if ( !unique && !roomIsBooked(booked_rooms, trainedRoom) ) {
                trainedRoomIndex = trainedRoom;
                added = true;
            }
        }
        if ( !added )
            throw new Error(`Impossible Attribution for ${gamemasters[x].name} : roomID : ${trainedRoomIndex}`);
        addGamemasterToSession(sessions, booked_rooms, gamemasters[x], trainedRoomIndex);
        gamemasters.splice(x, 1);
        x--;
    }

    sessions.forEach((element) => {
        console.log(element);
    });
}



const main = () => {
    const gamemasters = random_gamemaster_array(ROOMS.length)
    const sessions = ROOMS.map(room => { return { room: room } })
    const rooms = ROOMS.slice()

    try {
        setGMToSession(gamemasters, sessions, rooms);
    }
    catch (error) {
        console.error(error.message);
    }

    /* TODO
    L'objectif est d'attribuer un Game Master à chaque session, en fonction des salles sur lesquelles ils sont formés.
    Chaque Game Master ne peut être attribué qu'à une seule session.

    Tu as toute liberté sur la méthode à utiliser. L'important est d'observer comment tu abordes et résous ce type de problème.

    Si une solution existe, ta fonction devra la trouver.
    Si le tirage aléatoire rend l'attribution impossible, il faudra le signaler. Sinon, tu devras afficher une solution valide.

    Un code commenté et expliqué sera particulièrement apprécié.

    /!\ L'annonce précise que nous cherchons un développeur avec quelques années d'expérience. Cet exercice doit être réalisé en 40 minutes maximum.
    */
}

main()
