#!/bin/sh

NEWNAME=""

for f in inputs*
	do
		
		#This is mostly redundant, as I could easily use some other program to extract both the timestamp and the name of the guest...
		
		
		#Extract the new name
		NEWNAME=$(head -n 1 "$f" | awk '{print $3}')
		
		#Hammer that new name into something we like
		
		#Replace months, obviously
		
		NEWNAME=$(echo $NEWNAME | perl -pe 's/september/09/')
		NEWNAME=$(echo $NEWNAME | perl -pe 's/october/10/ ')
		NEWNAME=$(echo $NEWNAME | perl -pe 's/november/11/')
		NEWNAME=$(echo $NEWNAME | perl -pe 's/december/12/')
		NEWNAME=$(echo $NEWNAME | perl -pe 's/january/01/')
		NEWNAME=$(echo $NEWNAME | perl -pe 's/february/02/')
		NEWNAME=$(echo $NEWNAME | perl -pe 's/march/03/')
		NEWNAME=$(echo $NEWNAME | perl -pe 's/april/04/')
		NEWNAME=$(echo $NEWNAME | perl -pe 's/may/05/')
		NEWNAME=$(echo $NEWNAME | perl -pe 's/june/06/')
		NEWNAME=$(echo $NEWNAME | perl -pe 's/july/07/')
		NEWNAME=$(echo $NEWNAME | perl -pe 's/august/08/')
		
		
		#remove leading excessive --, and replace ----
		NEWNAME=$(echo $NEWNAME | perl -pe 's/--/-/')
		NEWNAME=$(echo $NEWNAME | perl -pe 's/---/_/')
		
		# Replace months, obviously:
		
		# Move year to front of timestamp
		# 's/(\d{2})-(\d{1,2})-(\d{4})/$3-$1-$2/
		NEWNAME=$(echo $NEWNAME | perl -pe 's/(\d{2})-(\d{1,2})-(\d{4})/$3-$1-$2/')
		
		# Datestamp is already at front, so, no need.
		# Otherwise, would use: 's/^(.*)(\d{4}-\d{2}-\d{1,2})/$2_$1/
		
		# Replace --- with _
		
		# Make sure that single day numbers are made two digits:
		NEWNAME=$(echo $NEWNAME | perl -pe 's/(\d{4})-(\d{2})-(\d{1}_)/$1-$2-0$3/')
		#NEWNAME=$(echo $NEWNAME | perl -pe 's/(\d{4})-(\d{2})-(\d{1}-)/HI/')
		
		#Insert name of show
		NEWNAME=$(echo $NEWNAME | perl -pe 's/_/_thedailyshow_/')
		
		echo "from $f: New name: $NEWNAME"
		echo "sh concatmp4.sh \"$f\" $NEWNAME.mp4 && rm $f"
done

#head -n 1 inputs-3668.txt | awk '{print $3}'