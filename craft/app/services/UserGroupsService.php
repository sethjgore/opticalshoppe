<?php
namespace Craft;

/**
 * Craft by Pixel & Tonic
 *
 * @package   Craft
 * @author    Pixel & Tonic, Inc.
 * @copyright Copyright (c) 2014, Pixel & Tonic, Inc.
 * @license   http://buildwithcraft.com/license Craft License Agreement
 * @link      http://buildwithcraft.com
 */

craft()->requirePackage(CraftPackage::Users);

/**
 *
 */
class UserGroupsService extends BaseApplicationComponent
{
	/**
	 * Returns all user groups.
	 *
	 * @param string|null $indexBy
	 * @return array
	 */
	public function getAllGroups($indexBy = null)
	{
		$groupRecords = UserGroupRecord::model()->findAll();
		return UserGroupModel::populateModels($groupRecords, $indexBy);
	}

	/**
	 * Gets a user group by its ID.
	 *
	 * @param int $groupId
	 * @return UserGroupModel
	 */
	public function getGroupById($groupId)
	{
		$groupRecord = UserGroupRecord::model()->findById($groupId);

		if ($groupRecord)
		{
			return UserGroupModel::populateModel($groupRecord);
		}
	}

	/**
	 * Gets a user group by its handle.
	 *
	 * @param int $groupHandle
	 * @return UserGroupModel
	 */
	public function getGroupByHandle($groupHandle)
	{
		$groupRecord = UserGroupRecord::model()->findByAttributes(array(
			'handle' => $groupHandle
		));

		if ($groupRecord)
		{
			return UserGroupModel::populateModel($groupRecord);
		}
	}

	/**
	 * Gets user groups by a user ID.
	 *
	 * @param int $userId
	 * @param string|null $indexBy
	 * @return array
	 */
	public function getGroupsByUserId($userId, $indexBy = null)
	{
		$query = craft()->db->createCommand()
			->select('g.*')
			->from('usergroups g')
			->join('usergroups_users gu', 'gu.groupId = g.id')
			->where(array('gu.userId' => $userId))
			->queryAll();

		return UserGroupModel::populateModels($query, $indexBy);
	}

	/**
	 * Saves a user group.
	 *
	 * @param UserGroupModel $group
	 * @return bool
	 */
	public function saveGroup(UserGroupModel $group)
	{
		$groupRecord = $this->_getGroupRecordById($group->id);

		$groupRecord->name = $group->name;
		$groupRecord->handle = $group->handle;

		if ($groupRecord->save())
		{
			// Now that we have a group ID, save it on the model
			if (!$group->id)
			{
				$group->id = $groupRecord->id;
			}

			return true;
		}
		else
		{
			$group->addErrors($groupRecord->getErrors());
			return false;
		}
	}

	/**
	 * Assigns a user to groups
	 *
	 * @param int $userId
	 * @param int|array $groupIds
	 * @return bool
	 */
	public function assignUserToGroups($userId, $groupIds = null)
	{
		craft()->db->createCommand()
			->delete('usergroups_users', array('userId' => $userId));

		if ($groupIds)
		{
			if (!is_array($groupIds))
			{
				$groupIds = array($groupIds);
			}

			foreach ($groupIds as $groupId)
			{
				$values[] = array($groupId, $userId);
			}

			craft()->db->createCommand()->insertAll('usergroups_users', array('groupId', 'userId'), $values);
		}

		return true;
	}

	/**
	 * Deletes a user group by its ID.
	 *
	 * @param int $groupId
	 * @return bool
	 */
	public function deleteGroupById($groupId)
	{
		craft()->db->createCommand()->delete('usergroups', array('id' => $groupId));
		return true;
	}

	/**
	 * Gets a group's record.
	 *
	 * @access private
	 * @param int $groupId
	 * @return UserGroupRecord
	 */
	private function _getGroupRecordById($groupId = null)
	{
		if ($groupId)
		{
			$groupRecord = UserGroupRecord::model()->findById($groupId);

			if (!$groupRecord)
			{
				$this->_noGroupExists($groupId);
			}
		}
		else
		{
			$groupRecord = new UserGroupRecord();
		}

		return $groupRecord;
	}

	/**
	 * Throws a "No group exists" exception.
	 *
	 * @access private
	 * @param int $groupId
	 * @throws Exception
	 */
	private function _noGroupExists($groupId)
	{
		throw new Exception(Craft::t('No group exists with the ID “{id}”', array('id' => $groupId)));
	}
}
