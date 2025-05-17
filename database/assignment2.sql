-- Insert a new record into the account table
INSERT INTO public.account (
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )
VALUES (
        'Tony',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@n'
    );
-- Modify the Tony Stark record to change the account_type to 'Admin'
UPDATE public.account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';
-- Delete the Tony Stark record from the database
DELETE FROM public.account
WHERE account_id = 1;
-- Modify the "GM Hummer" record description to replace "small interiors" with "a huge interior"
UPDATE public.inventory
SET inv_description = REPLACE(
        inv_description,
        'small interiors',
        'a huge interior'
    )
WHERE inv_make = 'GM'
    AND inv_model = 'Hummer';
-- Use an inner join to select make, model, and classification name for "Sport" category
SELECT inv_make,
    inv_model,
    classification_name
FROM public.inventory
    INNER JOIN public.classification ON public.inventory.classification_id = public.classification.classification_id
WHERE classification_name = 'Sport';
-- Update all records in the inventory table to add "/vehicles" to the file paths
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');