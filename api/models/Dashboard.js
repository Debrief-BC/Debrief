'use strict';

module.exports = {
  getMainDashboard: function(user, team, files, links, status_messages, skip, limit) {
    var query = "SELECT * FROM (";
    var queryParams = [];
    var addunion = '';
    skip = Number.parseInt(skip) || 0;
    limit = Number.parseInt(limit) || 30;

    if (links) {
      query += addunion + ` SELECT
        links.id AS id,
            chat_user.chat AS chat,
            links.user AS user,
            links.link AS link,
            links.createdAt AS createdAt,
            links.title AS title,
            NULL AS name,
            NULL AS filename,
            NULL AS extension,
            NULL AS size,
            NULL AS body,
            'link' AS type
    FROM
        chat_user
    RIGHT JOIN links ON links.chat = chat_user.chat
    WHERE
        chat_user.user = ? AND chat_user.team = ?`;
      queryParams.push(user);
      queryParams.push(team);
      addunion = ' UNION ';
    }

    if (files) {
      query += addunion + ` SELECT
        files.id AS id,
            chat_user.chat AS chat,
            files.user AS user,
            NULL AS link,
            files.createdAt AS createdAt,
            NULL AS title,
            files.name AS name,
            files.filename AS filename,
            files.extension AS extension,
            files.size AS size,
            NULL AS body,
            'file' AS type
    FROM
        chat_user
    RIGHT JOIN files ON files.chat = chat_user.chat
    WHERE
        chat_user.user = ? AND chat_user.team = ?`;
      queryParams.push(user);
      queryParams.push(team);
      addunion = ' UNION ';
    }

    if (status_messages) {
      query += addunion + ` SELECT
        chat_message.id AS id,
            chat_user.chat AS chat,
            chat_message.from AS user,
            NULL AS link,
            chat_message.createdAt AS createdAt,
            NULL AS title,
            NULL AS name,
            file AS filename,
            NULL AS extension,
            NULL AS size,
            chat_message.body AS body,
            chat_message.type AS type
    FROM
        chat_user
    RIGHT JOIN chat_message ON chat_message.chat = chat_user.chat
    WHERE
        chat_user.user = ? AND chat_user.team = ?
            AND (chat_message.type = 'participant_added'
            OR chat_message.type = 'participant_removed' OR chat_message.type = 'chat_avatar' OR chat_message.type = 'participant_left') `;
      queryParams.push(user);
      queryParams.push(team);
      addunion = ' UNION ';
    }

    query += `)  AS tbl
LEFT JOIN chat ON tbl.chat = chat.id LEFT JOIN team_user ON tbl.user = team_user.id
ORDER BY tbl.createdAt DESC , tbl.id
LIMIT ? OFFSET ?
`;
    queryParams.push(limit);
    queryParams.push(skip);

    return Dashboard.rawQuery({
      sql: query,
      nestTables: true
    }, queryParams);
  },
  getDashboardNotifications: function(user, team, call_logs, at_mentions, voicemail, skip, limit) {
    var query = "SELECT * FROM (";
    var queryParams = [];
    var addunion = '';
    skip = Number.parseInt(skip) || 0;
    limit = Number.parseInt(limit) || 30;

    if (at_mentions) {
      query += addunion + ` SELECT
    chat_message.id AS id,
    'message' AS \`notification_type\`,
    chat_message.type as type,
    chat_message.\`from\` AS \`from\`,
    chat_message.chat AS chat,
    chat_message.createdAt AS createdAt,
    chat_message.body AS body,
    null as other_caller_id_name,
    null as other_caller_id_number
FROM
    user_mention
        LEFT JOIN
    chat_message ON user_mention.message = chat_message.id
WHERE
    user_mention.user = ? and
    user_mention.team = ?`;
      queryParams.push(user);
      queryParams.push(team);
      addunion = ' UNION ';
    }

    if (call_logs) {
      query += addunion + ` SELECT
    call_log.id AS id,
    'call_log' AS \`notification_type\`,
	call_log.type AS type,
    call_log.other_user as \`from\`,
    call_log.other_chat as chat,
    call_log.createdAt as createdAt,
    null AS body,
    call_log.other_caller_id_name as other_caller_id_name,
    call_log.other_caller_id_number as other_caller_id_number
FROM
	call_log
WHERE
	call_log.owner = ? and call_log.team = ? and call_log.type = 'missed_incoming'`;
      queryParams.push(user);
      queryParams.push(team);
      addunion = ' UNION ';
    }

    query += ` ORDER BY createdAt DESC, id)  AS tbl
LEFT JOIN
chat
ON tbl.chat = chat.id
LEFT JOIN team_user ON tbl.\`from\` = team_user.id
LIMIT ? OFFSET ?;
`;
    queryParams.push(limit);
    queryParams.push(skip);

    return Dashboard.rawQuery({
      sql: query,
      nestTables: true
    }, queryParams);
  },

  getTimeline: function(user, team, options, skip, limit) {
    var searchOptions = [];
    options.forEach(function(option) {
      switch (option) {
        case 'files':
          searchOptions.push('file');
          break;
        case 'links':
          searchOptions.push('link');
          break;
        case 'status':
          searchOptions.push('participant_removed', 'chat_avatar', 'participant_left', 'participant_added', 'user_added', 'chat_locked', 'chat_added');
          break;
        case 'call_logs':
          searchOptions.push('missed_incoming');
          break;
        case 'at_mentions':
          searchOptions.push('at_mention');
          break;
        case 'voicemail':
          searchOptions.push('voicemail');
          break;
        case 'events':
          searchOptions.push('event');
          break;
      }
    });
    return Notifications.find({
        user: user,
        team: team,
        type: searchOptions
      })
      .sort('createdAt DESC')
      .limit(limit)
      .skip(skip)
      .populate('file')
      .populate('link')
      .populate('voicemail')
      .populate('call_log')
      .populate('message')
      .populate('user_mention')
      .populate('new_user')
      .populate('event_owner')
      .populate('chat')

  },
  getNotifications: function(user, team, options, skip, limit) {
    var searchOptions = [];
    options.forEach(function(option) {
      switch (option) {
        case 'status':
          searchOptions.push('participant_added', 'user_added', 'chat_added');
          break;
        case 'call_logs':
          searchOptions.push('missed_incoming');
          break;
        case 'at_mentions':
          searchOptions.push('at_mention');
          break;
        case 'voicemail':
          searchOptions.push('voicemail');
          break;
        case 'events':
          searchOptions.push('event');
          break;
      }
    });
    return Notifications.find({
        user: user,
        team: team,
        type: searchOptions,
        deletedAt: null
      })
      .sort('createdAt DESC')
      .limit(limit)
      .skip(skip)
      .populate('file')
      .populate('link')
      .populate('voicemail')
      .populate('call_log')
      .populate('message')
      .populate('user_mention')
      .populate('new_user')
      .populate('event_owner')
      .populate('chat')
  }
}