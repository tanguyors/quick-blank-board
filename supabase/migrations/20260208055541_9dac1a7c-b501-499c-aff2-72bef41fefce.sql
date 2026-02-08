-- D'abord supprimer les messages des conversations liées
DELETE FROM messages WHERE conversation_id IN (
  SELECT id FROM conversations WHERE property_id IN (
    'fcdc75c7-2505-4df5-b183-eb668692c3c6',
    '5db2dfad-6f7a-46c5-b964-a4c4376c3288',
    'a4ad462c-896a-4426-8726-377802a68e8a',
    'd48f9014-aa73-4ef4-9795-6d1fcbb32185',
    '25d5e55b-2894-4669-af2c-015256d07e5d',
    'df934410-a960-45a3-adde-7049f1857adc'
  )
);

-- Supprimer les conversations (avant les matches car FK match_id)
DELETE FROM conversations WHERE property_id IN (
  'fcdc75c7-2505-4df5-b183-eb668692c3c6',
  '5db2dfad-6f7a-46c5-b964-a4c4376c3288',
  'a4ad462c-896a-4426-8726-377802a68e8a',
  'd48f9014-aa73-4ef4-9795-6d1fcbb32185',
  '25d5e55b-2894-4669-af2c-015256d07e5d',
  'df934410-a960-45a3-adde-7049f1857adc'
);

-- Supprimer les visites
DELETE FROM visits WHERE property_id IN (
  'fcdc75c7-2505-4df5-b183-eb668692c3c6',
  '5db2dfad-6f7a-46c5-b964-a4c4376c3288',
  'a4ad462c-896a-4426-8726-377802a68e8a',
  'd48f9014-aa73-4ef4-9795-6d1fcbb32185',
  '25d5e55b-2894-4669-af2c-015256d07e5d',
  'df934410-a960-45a3-adde-7049f1857adc'
);

-- Supprimer les favoris
DELETE FROM favorites WHERE property_id IN (
  'fcdc75c7-2505-4df5-b183-eb668692c3c6',
  '5db2dfad-6f7a-46c5-b964-a4c4376c3288',
  'a4ad462c-896a-4426-8726-377802a68e8a',
  'd48f9014-aa73-4ef4-9795-6d1fcbb32185',
  '25d5e55b-2894-4669-af2c-015256d07e5d',
  'df934410-a960-45a3-adde-7049f1857adc'
);

-- Supprimer les swipes
DELETE FROM swipes WHERE property_id IN (
  'fcdc75c7-2505-4df5-b183-eb668692c3c6',
  '5db2dfad-6f7a-46c5-b964-a4c4376c3288',
  'a4ad462c-896a-4426-8726-377802a68e8a',
  'd48f9014-aa73-4ef4-9795-6d1fcbb32185',
  '25d5e55b-2894-4669-af2c-015256d07e5d',
  'df934410-a960-45a3-adde-7049f1857adc'
);

-- Supprimer les matches (après les conversations)
DELETE FROM matches WHERE property_id IN (
  'fcdc75c7-2505-4df5-b183-eb668692c3c6',
  '5db2dfad-6f7a-46c5-b964-a4c4376c3288',
  'a4ad462c-896a-4426-8726-377802a68e8a',
  'd48f9014-aa73-4ef4-9795-6d1fcbb32185',
  '25d5e55b-2894-4669-af2c-015256d07e5d',
  'df934410-a960-45a3-adde-7049f1857adc'
);

-- Supprimer les médias
DELETE FROM property_media WHERE property_id IN (
  'fcdc75c7-2505-4df5-b183-eb668692c3c6',
  '5db2dfad-6f7a-46c5-b964-a4c4376c3288',
  'a4ad462c-896a-4426-8726-377802a68e8a',
  'd48f9014-aa73-4ef4-9795-6d1fcbb32185',
  '25d5e55b-2894-4669-af2c-015256d07e5d',
  'df934410-a960-45a3-adde-7049f1857adc'
);

-- Enfin supprimer les propriétés africaines
DELETE FROM properties WHERE id IN (
  'fcdc75c7-2505-4df5-b183-eb668692c3c6',
  '5db2dfad-6f7a-46c5-b964-a4c4376c3288',
  'a4ad462c-896a-4426-8726-377802a68e8a',
  'd48f9014-aa73-4ef4-9795-6d1fcbb32185',
  '25d5e55b-2894-4669-af2c-015256d07e5d',
  'df934410-a960-45a3-adde-7049f1857adc'
);