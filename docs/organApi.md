# Organ-Api

## Database
---
The data is stored in a Mysql-database on my raspberrypi. There are the tables:

### Song-Table
The song table holds information about the songs which are played in the worship service

| Field    | Type         | Description                                          |
| -------- | ------------ | ---------------------------------------------------- |
| SongID   | varchar(10)  | The song id                                          |
| Title    | varchar(255) | The title of the song                                |
| Section  | varchar(255) | The section of the song                              |
| Verses   | int(11)      | The number of verses                                 |
| Category | varchar(255) | The category of the song                             |
| Melody   | varchar(10)  | The songID of the song from which the melody is used |

### Events-Table
The Events-Table holds information about events where I played the organ

| Field    | Type         | Description                                                       |
| -------- | ------------ | ----------------------------------------------------------------- |
| Date     | datetime     | The date of the event                                             |
| Location | varchar(255) | The location of the event                                         |
| Comment  | varchar(255) | Additional comments on the event (like "Taufe","Weihnachten",...) |

### Played-Table
The "Played-Table" represents the relation between the Events-Table and the Songs-Table. It stores information about which song was played on which event.

| Field    | Type         | Description                        |
| -------- | ------------ | ---------------------------------- |
| Date     | datetime     | The date of the event              |
| SongID   | varchar(10)  | The ID of the song that was played |
| Verses   | varchar(255) | The verses that where sung         |
| Position | int(11)      | A number to order the songs        |

## Api Requests
---

### Songs ```/api/music/organ/songs```
---
**GET**-requests must contain a ```songID``` query parameter. Otherwise the server returns a 403 resoponse. If a valid songID is entered the returned response contains a json body of the format:
```
{
    "songID": string,
    "title": string,
    "category": string,
    "section": string,
    "verses": number | undefined,
    "melody": string | undefined
}
```

**POST**-requests must contain a http Content-Type header with the value ```application/json``` and a json body similar to the resonse of the GET-request. Otherwise a response with status code 415 is send as a response. If the song was created or updated sucessfully a response of status code 201 is returned from the server. In the case of an error during the creation/update of the database entry a response with status code 500 is returned.

### Events ```/api/music/organ/events/```
---
**GET**-requests must be sent to ```/api/music/organ/events/[year]/[month]/[day]```. The parameters ```[year]```, ```[month]``` and ```[day]``` define the range of the events returned. For example if the request is directed to ```/api/music/organ/2023/05``` all events that took place in march 2023 are returned.
Alternatively the request can be sent to ```/api/music/organ/events``` with a query parameter ```date```. If this is the case, the request is going to be redirected to ```/api/music/organ/events/[year]/[month]/[day]``` where the values are replaced with the given date. The response contains the event data formatted as json

```
{
    "songsPlayed": [
        {
            "song": {
                "title": string,
                "category": string,
                "section": string
            },
            "verses": string
        },
        ...
    ],
    "date": Date,
    "location": string,
    "comment": string
}
```

**POST**-requests must contain a http ```Content-Type``` header with the value ```application/json```. The json format is
```
{
    "date": Date,
    "location": string,
    "comment": string | undefined,
    "songsPlayed": [
        {
            "songID": string,
            "verses": string
        },
        ...
    ]
}
```
